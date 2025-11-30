import { Injectable, Logger } from '@nestjs/common';
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
import { UpdateSubscriptionDto } from '../dto';

/**
 * Service for subscription updates and cancellations
 */
@Injectable()
export class SubscriptionManagementService {
  private readonly logger = new Logger(SubscriptionManagementService.name);

  constructor(
    @InjectModel(StoreSubscription.name)
    private readonly subscriptionModel: Model<StoreSubscriptionDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeProfileModel: Model<StoreOwnerProfileDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async update(
    subscription: StoreSubscriptionDocument,
    updateDto: UpdateSubscriptionDto,
    adminId: string,
  ): Promise<StoreSubscriptionDocument> {
    if (updateDto.status === SubscriptionStatus.CANCELLED) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledBy = new Types.ObjectId(adminId);
      subscription.cancelledAt = new Date();
      subscription.cancellationReason = updateDto.cancellationReason;

      const store = await this.storeProfileModel
        .findById(subscription.storeId)
        .exec();
      if (store) {
        await this.resetStoreProfile(store);
      }

      this.logger.log(
        `Subscription ${subscription._id} cancelled by admin ${adminId}`,
      );

      this.eventEmitter.emit('subscription.cancelled', {
        storeId: subscription.storeId.toString(),
        reason: updateDto.cancellationReason,
      });
    }

    if (updateDto.endDate) {
      subscription.endDate = updateDto.endDate;

      const store = await this.storeProfileModel
        .findById(subscription.storeId)
        .exec();
      if (store) {
        store.subscriptionExpiresAt = updateDto.endDate;
        await store.save();
      }

      this.logger.log(
        `Subscription ${subscription._id} end date extended to ${updateDto.endDate}`,
      );

      this.eventEmitter.emit('subscription.extended', {
        storeId: subscription.storeId.toString(),
        newEndDate: updateDto.endDate,
      });
    }

    if (updateDto.autoRenew !== undefined) {
      subscription.autoRenew = updateDto.autoRenew;
    }

    if (updateDto.notes) {
      subscription.notes = updateDto.notes;
    }

    return await subscription.save();
  }

  async checkExpiredSubscriptions(): Promise<void> {
    const now = new Date();

    const expiredSubscriptions = await this.subscriptionModel
      .find({
        status: SubscriptionStatus.ACTIVE,
        endDate: { $lte: now },
      })
      .populate('storeId')
      .exec();

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await subscription.save();

      const store = await this.storeProfileModel
        .findById(subscription.storeId)
        .exec();
      if (store) {
        await this.resetStoreProfile(store);
      }

      this.logger.log(
        `Subscription ${subscription._id} expired for store ${subscription.storeId}`,
      );

      this.eventEmitter.emit('subscription.expired', {
        storeId: subscription.storeId.toString(),
      });
    }
  }

  private async resetStoreProfile(
    store: StoreOwnerProfileDocument,
  ): Promise<void> {
    store.hasActiveSubscription = false;
    store.currentPlanId = undefined;
    store.subscriptionExpiresAt = undefined;
    store.dailyProductLimit = 0;
    store.maxImagesPerProduct = 0;
    store.maxVariantsPerProduct = 0;
    await store.save();
  }
}
