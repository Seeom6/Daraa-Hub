import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CustomerProfile, CustomerProfileDocument } from '../../../../database/schemas/customer-profile.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class CustomerProfileRepository extends BaseRepository<CustomerProfileDocument> {
  constructor(
    @InjectModel(CustomerProfile.name) private readonly customerProfileModel: Model<CustomerProfileDocument>,
  ) {
    super(customerProfileModel);
  }

  /**
   * Find customer profile by account ID
   */
  async findByAccountId(accountId: string): Promise<CustomerProfileDocument | null> {
    return this.model.findOne({ accountId }).exec();
  }

  /**
   * Update loyalty points
   */
  async updateLoyaltyPoints(accountId: string, points: number): Promise<CustomerProfileDocument | null> {
    return this.model.findOneAndUpdate(
      { accountId },
      { $inc: { loyaltyPoints: points } },
      { new: true }
    ).exec();
  }

  /**
   * Get customers by tier
   */
  async findByTier(tier: 'bronze' | 'silver' | 'gold' | 'platinum'): Promise<CustomerProfileDocument[]> {
    return this.model.find({ tier }).exec();
  }
}

