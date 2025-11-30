import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas/store-owner-profile.schema';
import { NotificationsService } from '../../notifications/services/notifications.service';

@Injectable()
export class SubscriptionEventsListener {
  private readonly logger = new Logger(SubscriptionEventsListener.name);

  constructor(
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeProfileModel: Model<StoreOwnerProfileDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @OnEvent('subscription.activated')
  async handleSubscriptionActivated(payload: {
    storeId: string;
    planName: string;
    endDate: Date;
  }) {
    try {
      const store = await this.storeProfileModel
        .findById(payload.storeId)
        .populate('accountId')
        .exec();
      if (!store) return;

      await this.notificationsService.sendFromTemplate({
        templateCode: 'SUBSCRIPTION_ACTIVATED',
        recipientId: (store.accountId as any)._id.toString(),
        channels: ['in_app', 'email'],
        variables: {
          storeName: store.storeName,
          planName: payload.planName,
          dailyLimit: store.dailyProductLimit.toString(),
          expiryDate: payload.endDate.toISOString().split('T')[0],
        },
      });

      this.logger.log(
        `Subscription activated notification sent to store ${payload.storeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send subscription activated notification: ${error.message}`,
      );
    }
  }

  @OnEvent('subscription.expired')
  async handleSubscriptionExpired(payload: {
    storeId: string;
    planName: string;
  }) {
    try {
      const store = await this.storeProfileModel
        .findById(payload.storeId)
        .populate('accountId')
        .exec();
      if (!store) return;

      await this.notificationsService.sendFromTemplate({
        templateCode: 'SUBSCRIPTION_EXPIRED',
        recipientId: (store.accountId as any)._id.toString(),
        channels: ['in_app', 'email', 'sms'],
        variables: {
          storeName: store.storeName,
          planName: payload.planName,
        },
      });

      this.logger.log(
        `Subscription expired notification sent to store ${payload.storeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send subscription expired notification: ${error.message}`,
      );
    }
  }

  @OnEvent('subscription.expiryWarning')
  async handleSubscriptionExpiryWarning(payload: {
    storeId: string;
    planName: string;
    daysLeft: number;
    expiryDate: string;
  }) {
    try {
      const store = await this.storeProfileModel
        .findById(payload.storeId)
        .populate('accountId')
        .exec();
      if (!store) return;

      await this.notificationsService.sendFromTemplate({
        templateCode: 'SUBSCRIPTION_EXPIRY_WARNING',
        recipientId: (store.accountId as any)._id.toString(),
        channels: ['in_app', 'email', 'sms'],
        variables: {
          storeName: store.storeName,
          planName: payload.planName,
          daysLeft: payload.daysLeft.toString(),
          expiryDate: payload.expiryDate,
        },
      });

      this.logger.log(
        `Subscription expiry warning sent to store ${payload.storeId} (${payload.daysLeft} days left)`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send subscription expiry warning: ${error.message}`,
      );
    }
  }

  @OnEvent('subscription.dailyLimitReached')
  async handleDailyLimitReached(payload: {
    storeId: string;
    dailyLimit: number;
  }) {
    try {
      const store = await this.storeProfileModel
        .findById(payload.storeId)
        .populate('accountId')
        .exec();
      if (!store) return;

      await this.notificationsService.sendFromTemplate({
        templateCode: 'DAILY_LIMIT_REACHED',
        recipientId: (store.accountId as any)._id.toString(),
        channels: ['in_app'],
        variables: {
          dailyLimit: payload.dailyLimit.toString(),
          planName: 'Current Plan',
        },
      });

      this.logger.log(
        `Daily limit reached notification sent to store ${payload.storeId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send daily limit reached notification: ${error.message}`,
      );
    }
  }

  @OnEvent('subscription.cancelled')
  async handleSubscriptionCancelled(payload: {
    storeId: string;
    reason?: string;
  }) {
    try {
      const store = await this.storeProfileModel
        .findById(payload.storeId)
        .populate('accountId')
        .exec();
      if (!store) return;

      this.logger.log(`Subscription cancelled for store ${payload.storeId}`);
    } catch (error) {
      this.logger.error(
        `Failed to handle subscription cancelled event: ${error.message}`,
      );
    }
  }

  @OnEvent('subscription.extended')
  async handleSubscriptionExtended(payload: {
    storeId: string;
    newEndDate: Date;
  }) {
    try {
      const store = await this.storeProfileModel
        .findById(payload.storeId)
        .populate('accountId')
        .exec();
      if (!store) return;

      this.logger.log(
        `Subscription extended for store ${payload.storeId} until ${payload.newEndDate}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle subscription extended event: ${error.message}`,
      );
    }
  }
}
