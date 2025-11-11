import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StoreSubscription,
  StoreSubscriptionDocument,
} from '../../../../database/schemas/store-subscription.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class SubscriptionRepository extends BaseRepository<StoreSubscriptionDocument> {
  constructor(
    @InjectModel(StoreSubscription.name)
    private readonly subscriptionModel: Model<StoreSubscriptionDocument>,
  ) {
    super(subscriptionModel);
  }

  /**
   * Find subscription by store ID
   */
  async findByStoreId(storeId: string): Promise<StoreSubscriptionDocument | null> {
    return this.subscriptionModel
      .findOne({ storeId: new Types.ObjectId(storeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find active subscription by store ID
   */
  async findActiveByStoreId(storeId: string): Promise<StoreSubscriptionDocument | null> {
    return this.findOne({
      storeId: new Types.ObjectId(storeId),
      status: 'active',
      endDate: { $gt: new Date() },
    });
  }

  /**
   * Find subscriptions by plan ID
   */
  async findByPlanId(
    planId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: StoreSubscriptionDocument[]; total: number }> {
    return this.findWithPagination(
      { planId: new Types.ObjectId(planId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find expiring subscriptions
   */
  async findExpiring(daysAhead: number = 7): Promise<StoreSubscriptionDocument[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.find({
      status: 'active',
      endDate: { $gte: now, $lte: futureDate },
    });
  }

  /**
   * Update subscription status
   */
  async updateStatus(
    subscriptionId: string,
    status: string,
  ): Promise<StoreSubscriptionDocument | null> {
    return this.findByIdAndUpdate(subscriptionId, { status });
  }

  /**
   * Renew subscription
   */
  async renewSubscription(
    subscriptionId: string,
    endDate: Date,
  ): Promise<StoreSubscriptionDocument | null> {
    return this.findByIdAndUpdate(subscriptionId, {
      status: 'active',
      endDate,
      renewedAt: new Date(),
    });
  }

  /**
   * Get subscription statistics
   */
  async getStatistics(): Promise<any> {
    return this.subscriptionModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amount' },
        },
      },
    ]);
  }
}

