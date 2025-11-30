import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

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
   * Check for expired subscriptions every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkExpiredSubscriptions(): Promise<void> {
    // Check if subscription system is enabled
    const settings = await this.settingsModel
      .findOne({ key: 'subscription' })
      .exec();
    const subscriptionSystemEnabled =
      settings?.value?.subscriptionSystemEnabled === true;

    if (!subscriptionSystemEnabled) {
      return;
    }

    const now = new Date();

    const expiredSubscriptions = await this.subscriptionModel
      .find({
        status: SubscriptionStatus.ACTIVE,
        endDate: { $lte: now },
      })
      .populate('storeId')
      .populate('planId')
      .exec();

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await subscription.save();

      // Update store profile
      const store = await this.storeProfileModel
        .findById(subscription.storeId)
        .exec();
      if (store) {
        store.hasActiveSubscription = false;
        store.currentPlanId = undefined;
        store.subscriptionExpiresAt = undefined;
        store.dailyProductLimit = 0;
        store.maxImagesPerProduct = 0;
        store.maxVariantsPerProduct = 0;
        await store.save();
      }

      this.logger.log(
        `Subscription ${subscription._id} expired for store ${subscription.storeId}`,
      );

      // Emit event for notification
      this.eventEmitter.emit('subscription.expired', {
        storeId: subscription.storeId.toString(),
        planName: (subscription.planId as any)?.name || 'Unknown',
      });
    }

    if (expiredSubscriptions.length > 0) {
      this.logger.log(
        `Processed ${expiredSubscriptions.length} expired subscriptions`,
      );
    }
  }

  /**
   * Check for subscriptions expiring soon (every day at 9 AM)
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkExpiringSoonSubscriptions(): Promise<void> {
    // Check if subscription system is enabled
    const settings = await this.settingsModel
      .findOne({ key: 'subscription' })
      .exec();
    const subscriptionSystemEnabled =
      settings?.value?.subscriptionSystemEnabled === true;

    if (!subscriptionSystemEnabled) {
      return;
    }

    const warningDays =
      settings?.value?.notificationSettings?.subscriptionExpiryWarningDays || 3;
    const now = new Date();
    const warningDate = new Date(
      now.getTime() + warningDays * 24 * 60 * 60 * 1000,
    );

    const expiringSoonSubscriptions = await this.subscriptionModel
      .find({
        status: SubscriptionStatus.ACTIVE,
        endDate: { $gte: now, $lte: warningDate },
      })
      .populate('storeId')
      .populate('planId')
      .exec();

    for (const subscription of expiringSoonSubscriptions) {
      const daysLeft = Math.ceil(
        (subscription.endDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      this.logger.log(
        `Subscription ${subscription._id} expiring in ${daysLeft} days for store ${subscription.storeId}`,
      );

      // Emit event for notification
      this.eventEmitter.emit('subscription.expiryWarning', {
        storeId: subscription.storeId.toString(),
        planName: (subscription.planId as any)?.name || 'Unknown',
        daysLeft,
        expiryDate: subscription.endDate.toISOString().split('T')[0],
      });
    }

    if (expiringSoonSubscriptions.length > 0) {
      this.logger.log(
        `Sent expiry warnings for ${expiringSoonSubscriptions.length} subscriptions`,
      );
    }
  }

  /**
   * Reset daily usage counters (every day at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyUsageCounters(): Promise<void> {
    this.logger.log(
      'Daily usage counters reset automatically by date-based logic',
    );
    // Note: Daily usage is tracked by date in the dailyUsage array,
    // so no manual reset is needed. The getTodayUsage() method
    // automatically returns 0 for new days.
  }
}
