import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  StoreSubscription,
  StoreSubscriptionDocument,
  SubscriptionStatus,
} from '../../../../database/schemas/store-subscription.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas/store-owner-profile.schema';
import {
  SystemSettings,
  SystemSettingsDocument,
} from '../../../../database/schemas/system-settings.schema';

/**
 * Service responsible for product subscription checks
 * Handles subscription limits and usage tracking
 */
@Injectable()
export class ProductSubscriptionService {
  private readonly logger = new Logger(ProductSubscriptionService.name);

  constructor(
    @InjectModel(StoreSubscription.name)
    private readonly subscriptionModel: Model<StoreSubscriptionDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(SystemSettings.name)
    private readonly settingsModel: Model<SystemSettingsDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Check subscription limits before creating product
   */
  async checkSubscriptionLimits(
    storeId: string,
    imageCount: number,
  ): Promise<void> {
    // Check if subscription system is enabled
    const settings = await this.settingsModel
      .findOne({ key: 'subscription' })
      .exec();
    const subscriptionSystemEnabled =
      settings?.value?.subscriptionSystemEnabled === true;

    if (!subscriptionSystemEnabled) {
      // Subscription system is disabled, allow all
      return;
    }

    // Get store profile
    const storeProfile = await this.storeProfileModel.findById(storeId).exec();
    if (!storeProfile) {
      throw new NotFoundException('Store not found');
    }

    // Check if store has active subscription
    if (!storeProfile.hasActiveSubscription) {
      throw new ForbiddenException(
        'Your subscription has expired. Please renew to continue publishing products.',
      );
    }

    // Get active subscription
    const subscription = await this.subscriptionModel
      .findOne({
        storeId: new Types.ObjectId(storeId),
        status: SubscriptionStatus.ACTIVE,
      })
      .populate('planId')
      .exec();

    if (!subscription) {
      throw new ForbiddenException(
        'No active subscription found. Please subscribe to a plan to continue.',
      );
    }

    // Check if subscription has expired
    if (subscription.endDate < new Date()) {
      throw new ForbiddenException(
        'Your subscription has expired. Please renew to continue publishing products.',
      );
    }

    // Check daily limit
    const todayUsage = subscription.getTodayUsage();
    const dailyLimit = storeProfile.dailyProductLimit;

    if (todayUsage >= dailyLimit) {
      // Emit event for notification
      this.eventEmitter.emit('subscription.dailyLimitReached', {
        storeId: storeId,
        dailyLimit,
      });

      throw new ForbiddenException(
        `Daily product limit reached (${dailyLimit} products/day). Please upgrade your plan or wait until tomorrow.`,
      );
    }

    // Check image limit
    const maxImages = storeProfile.maxImagesPerProduct;
    if (imageCount > maxImages) {
      throw new ForbiddenException(
        `Image limit exceeded. Your plan allows maximum ${maxImages} images per product.`,
      );
    }
  }

  /**
   * Increment daily usage counter after product creation
   */
  async incrementDailyUsage(storeId: string): Promise<void> {
    // Check if subscription system is enabled
    const settings = await this.settingsModel
      .findOne({ key: 'subscription' })
      .exec();
    const subscriptionSystemEnabled =
      settings?.value?.subscriptionSystemEnabled === true;

    if (!subscriptionSystemEnabled) {
      return;
    }

    // Get active subscription
    const subscription = await this.subscriptionModel
      .findOne({
        storeId: new Types.ObjectId(storeId),
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();

    if (subscription) {
      await subscription.incrementTodayUsage();
      this.logger.log(
        `Daily usage incremented for store ${storeId}: ${subscription.getTodayUsage()}`,
      );
    }
  }
}
