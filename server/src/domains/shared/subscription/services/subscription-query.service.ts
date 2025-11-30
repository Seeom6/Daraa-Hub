import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StoreSubscription,
  StoreSubscriptionDocument,
  SubscriptionStatus,
} from '../../../../database/schemas/store-subscription.schema';

/**
 * Service for subscription queries
 */
@Injectable()
export class SubscriptionQueryService {
  constructor(
    @InjectModel(StoreSubscription.name)
    private readonly subscriptionModel: Model<StoreSubscriptionDocument>,
  ) {}

  async findOne(id: string): Promise<StoreSubscriptionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid subscription ID');
    }

    const subscription = await this.subscriptionModel
      .findById(id)
      .populate('planId')
      .populate('storeId')
      .exec();

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async getActiveSubscription(
    storeId: string,
  ): Promise<StoreSubscriptionDocument | null> {
    const subscription = await this.subscriptionModel
      .findOne({
        storeId: new Types.ObjectId(storeId),
        status: SubscriptionStatus.ACTIVE,
      })
      .populate('planId')
      .exec();

    return subscription;
  }

  async getStoreSubscriptions(
    storeId: string,
  ): Promise<StoreSubscriptionDocument[]> {
    const subscriptions = await this.subscriptionModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .populate('planId')
      .sort({ createdAt: -1 })
      .exec();

    return subscriptions;
  }

  async findAll(filters?: {
    status?: SubscriptionStatus;
    storeId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: StoreSubscriptionDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { status, storeId, page = 1, limit = 20 } = filters || {};

    const filter: any = {};
    if (status) filter.status = status;
    if (storeId) filter.storeId = new Types.ObjectId(storeId);

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.subscriptionModel
        .find(filter)
        .populate('planId')
        .populate('storeId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.subscriptionModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }
}
