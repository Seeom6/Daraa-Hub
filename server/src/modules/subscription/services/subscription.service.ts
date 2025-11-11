import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  StoreSubscription,
  StoreSubscriptionDocument,
  SubscriptionStatus,
  SubscriptionPaymentMethod,
} from '../../../database/schemas/store-subscription.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from '../../../database/schemas/subscription-plan.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../database/schemas/store-owner-profile.schema';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectModel(StoreSubscription.name)
    private readonly subscriptionModel: Model<StoreSubscriptionDocument>,
    @InjectModel(SubscriptionPlan.name)
    private readonly planModel: Model<SubscriptionPlanDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeProfileModel: Model<StoreOwnerProfileDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new subscription (Admin only)
   */
  async create(createDto: CreateSubscriptionDto, adminId: string): Promise<StoreSubscriptionDocument> {
    // Verify plan exists
    const plan = await this.planModel.findById(createDto.planId).exec();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Verify store exists
    const store = await this.storeProfileModel.findById(createDto.storeId).exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }

    // Check if store has active subscription
    const activeSubscription = await this.subscriptionModel
      .findOne({
        storeId: new Types.ObjectId(createDto.storeId),
        status: SubscriptionStatus.ACTIVE,
      })
      .exec();

    if (activeSubscription) {
      throw new ConflictException('Store already has an active subscription');
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

    const subscription = new this.subscriptionModel({
      storeId: new Types.ObjectId(createDto.storeId),
      planId: new Types.ObjectId(createDto.planId),
      paymentMethod: createDto.paymentMethod,
      amountPaid: createDto.amountPaid,
      paymentReference: createDto.paymentReference,
      status: SubscriptionStatus.ACTIVE,
      startDate: now,
      endDate,
      activatedBy: new Types.ObjectId(adminId),
      activatedAt: now,
      notes: createDto.notes,
      dailyUsage: [],
      totalProductsPublished: 0,
      autoRenew: false,
    });

    const saved = await subscription.save();

    // Update store profile
    await this.updateStoreProfile(store, plan, endDate);

    this.logger.log(`Subscription created for store ${createDto.storeId} with plan ${plan.name}`);

    // Emit event for notification
    this.eventEmitter.emit('subscription.activated', {
      storeId: createDto.storeId,
      planName: plan.name,
      endDate,
    });

    return saved;
  }

  /**
   * Get subscription by ID
   */
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

  /**
   * Get store's active subscription
   */
  async getActiveSubscription(storeId: string): Promise<StoreSubscriptionDocument | null> {
    const subscription = await this.subscriptionModel
      .findOne({
        storeId: new Types.ObjectId(storeId),
        status: SubscriptionStatus.ACTIVE,
      })
      .populate('planId')
      .exec();

    return subscription;
  }

  /**
   * Get all subscriptions for a store
   */
  async getStoreSubscriptions(storeId: string): Promise<StoreSubscriptionDocument[]> {
    const subscriptions = await this.subscriptionModel
      .find({ storeId: new Types.ObjectId(storeId) })
      .populate('planId')
      .sort({ createdAt: -1 })
      .exec();

    return subscriptions;
  }

  /**
   * Get all subscriptions (Admin)
   */
  async findAll(filters?: {
    status?: SubscriptionStatus;
    storeId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: StoreSubscriptionDocument[]; total: number; page: number; limit: number }> {
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

  /**
   * Update subscription (Admin only)
   */
  async update(
    id: string,
    updateDto: UpdateSubscriptionDto,
    adminId: string,
  ): Promise<StoreSubscriptionDocument> {
    const subscription = await this.findOne(id);

    if (updateDto.status === SubscriptionStatus.CANCELLED) {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledBy = new Types.ObjectId(adminId);
      subscription.cancelledAt = new Date();
      subscription.cancellationReason = updateDto.cancellationReason;

      // Update store profile
      const store = await this.storeProfileModel.findById(subscription.storeId).exec();
      if (store) {
        store.hasActiveSubscription = false;
        store.currentPlanId = undefined;
        store.subscriptionExpiresAt = undefined;
        store.dailyProductLimit = 0;
        store.maxImagesPerProduct = 0;
        store.maxVariantsPerProduct = 0;
        await store.save();
      }

      this.logger.log(`Subscription ${id} cancelled by admin ${adminId}`);

      // Emit event
      this.eventEmitter.emit('subscription.cancelled', {
        storeId: subscription.storeId.toString(),
        reason: updateDto.cancellationReason,
      });
    }

    if (updateDto.endDate) {
      subscription.endDate = updateDto.endDate;

      // Update store profile
      const store = await this.storeProfileModel.findById(subscription.storeId).exec();
      if (store) {
        store.subscriptionExpiresAt = updateDto.endDate;
        await store.save();
      }

      this.logger.log(`Subscription ${id} end date extended to ${updateDto.endDate}`);

      // Emit event
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

  /**
   * Check and update expired subscriptions (Cron job)
   */
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

      // Update store profile
      const store = await this.storeProfileModel.findById(subscription.storeId).exec();
      if (store) {
        store.hasActiveSubscription = false;
        store.currentPlanId = undefined;
        store.subscriptionExpiresAt = undefined;
        store.dailyProductLimit = 0;
        store.maxImagesPerProduct = 0;
        store.maxVariantsPerProduct = 0;
        await store.save();
      }

      this.logger.log(`Subscription ${subscription._id} expired for store ${subscription.storeId}`);

      // Emit event
      this.eventEmitter.emit('subscription.expired', {
        storeId: subscription.storeId.toString(),
      });
    }
  }

  /**
   * Helper: Update store profile with subscription details
   */
  private async updateStoreProfile(
    store: StoreOwnerProfileDocument,
    plan: SubscriptionPlanDocument,
    endDate: Date,
  ): Promise<void> {
    store.hasActiveSubscription = true;
    store.currentPlanId = plan._id as Types.ObjectId;
    store.subscriptionExpiresAt = endDate;
    store.dailyProductLimit = plan.features.dailyProductLimit;
    store.maxImagesPerProduct = plan.features.maxImagesPerProduct;
    store.maxVariantsPerProduct = plan.features.maxVariantsPerProduct;
    await store.save();
  }
}

