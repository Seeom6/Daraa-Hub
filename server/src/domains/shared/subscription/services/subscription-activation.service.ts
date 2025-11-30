import {
  Injectable,
  NotFoundException,
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
} from '../../../../database/schemas/store-subscription.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from '../../../../database/schemas/subscription-plan.schema';
import {
  StoreOwnerProfile,
  StoreOwnerProfileDocument,
} from '../../../../database/schemas/store-owner-profile.schema';
import { CreateSubscriptionDto } from '../dto';

/**
 * Service for subscription activation
 */
@Injectable()
export class SubscriptionActivationService {
  private readonly logger = new Logger(SubscriptionActivationService.name);

  constructor(
    @InjectModel(StoreSubscription.name)
    private readonly subscriptionModel: Model<StoreSubscriptionDocument>,
    @InjectModel(SubscriptionPlan.name)
    private readonly planModel: Model<SubscriptionPlanDocument>,
    @InjectModel(StoreOwnerProfile.name)
    private readonly storeProfileModel: Model<StoreOwnerProfileDocument>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    createDto: CreateSubscriptionDto,
    adminId: string,
  ): Promise<StoreSubscriptionDocument> {
    const plan = await this.planModel.findById(createDto.planId).exec();
    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    const store = await this.storeProfileModel
      .findById(createDto.storeId)
      .exec();
    if (!store) {
      throw new NotFoundException('Store not found');
    }

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
    const endDate = new Date(
      now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000,
    );

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

    await this.updateStoreProfile(store, plan, endDate);

    this.logger.log(
      `Subscription created for store ${createDto.storeId} with plan ${plan.name}`,
    );

    this.eventEmitter.emit('subscription.activated', {
      storeId: createDto.storeId,
      planName: plan.name,
      endDate,
    });

    return saved;
  }

  async updateStoreProfile(
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
