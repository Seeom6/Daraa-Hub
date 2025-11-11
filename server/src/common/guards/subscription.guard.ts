import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../database/schemas/store-owner-profile.schema';
import {
  StoreSubscription,
  StoreSubscriptionDocument,
  SubscriptionStatus,
} from '../../database/schemas/store-subscription.schema';
import {
  SystemSettings,
  SystemSettingsDocument,
} from '../../database/schemas/system-settings.schema';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeProfileModel: Model<StoreOwnerProfileDocument>,
    @InjectModel(StoreSubscription.name)
    private readonly subscriptionModel: Model<StoreSubscriptionDocument>,
    @InjectModel(SystemSettings.name)
    private readonly settingsModel: Model<SystemSettingsDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Only apply to store owners
    if (!user || user.role !== 'store_owner') {
      return true;
    }

    // Check if subscription system is enabled
    const settings = await this.settingsModel.findOne({ key: 'subscription' }).exec();
    const subscriptionSystemEnabled = settings?.value?.subscriptionSystemEnabled === true;

    if (!subscriptionSystemEnabled) {
      // Subscription system is disabled, allow all
      return true;
    }

    // Get store profile
    const storeProfile = await this.storeProfileModel.findOne({ userId: user.userId }).exec();
    if (!storeProfile) {
      throw new ForbiddenException('Store profile not found');
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
        storeId: storeProfile._id,
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
      throw new ForbiddenException(
        `Daily product limit reached (${dailyLimit} products/day). Please upgrade your plan or wait until tomorrow.`,
      );
    }

    // Attach subscription info to request for later use
    request.subscription = subscription;
    request.storeProfile = storeProfile;

    return true;
  }
}

