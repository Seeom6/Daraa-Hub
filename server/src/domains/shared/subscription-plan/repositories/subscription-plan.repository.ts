import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from '../../../../database/schemas/subscription-plan.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class SubscriptionPlanRepository extends BaseRepository<SubscriptionPlanDocument> {
  constructor(
    @InjectModel(SubscriptionPlan.name)
    private readonly planModel: Model<SubscriptionPlanDocument>,
  ) {
    super(planModel);
  }

  /**
   * Find plan by name
   */
  async findByName(name: string): Promise<SubscriptionPlanDocument | null> {
    return this.findOne({ name });
  }

  /**
   * Find all active plans
   */
  async findActivePlans(): Promise<SubscriptionPlanDocument[]> {
    return this.find({ isActive: true }, { sort: { price: 1 } });
  }

  /**
   * Find plans by price range
   */
  async findByPriceRange(
    minPrice: number,
    maxPrice: number,
  ): Promise<SubscriptionPlanDocument[]> {
    return this.find({
      price: { $gte: minPrice, $lte: maxPrice },
      isActive: true,
    });
  }

  /**
   * Toggle plan active status
   */
  async toggleActive(planId: string): Promise<SubscriptionPlanDocument | null> {
    const plan = await this.findById(planId);
    if (!plan) return null;

    return this.findByIdAndUpdate(planId, { isActive: !plan.isActive });
  }

  /**
   * Get most popular plan
   */
  async getMostPopular(): Promise<SubscriptionPlanDocument | null> {
    return this.planModel
      .findOne({ isActive: true })
      .sort({ subscriberCount: -1 })
      .exec();
  }

  /**
   * Increment subscriber count
   */
  async incrementSubscribers(
    planId: string,
  ): Promise<SubscriptionPlanDocument | null> {
    return this.planModel.findByIdAndUpdate(
      planId,
      { $inc: { subscriberCount: 1 } },
      { new: true },
    );
  }

  /**
   * Decrement subscriber count
   */
  async decrementSubscribers(
    planId: string,
  ): Promise<SubscriptionPlanDocument | null> {
    return this.planModel.findByIdAndUpdate(
      planId,
      { $inc: { subscriberCount: -1 } },
      { new: true },
    );
  }
}
