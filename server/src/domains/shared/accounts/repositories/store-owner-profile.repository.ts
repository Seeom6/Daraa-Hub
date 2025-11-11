import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StoreOwnerProfile, StoreOwnerProfileDocument } from '../../../../database/schemas/store-owner-profile.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class StoreOwnerProfileRepository extends BaseRepository<StoreOwnerProfileDocument> {
  constructor(
    @InjectModel(StoreOwnerProfile.name) private readonly storeOwnerProfileModel: Model<StoreOwnerProfileDocument>,
  ) {
    super(storeOwnerProfileModel);
  }

  /**
   * Find store owner profile by account ID
   */
  async findByAccountId(accountId: string): Promise<StoreOwnerProfileDocument | null> {
    return this.model.findOne({ accountId }).exec();
  }

  /**
   * Find active stores
   */
  async findActiveStores(): Promise<StoreOwnerProfileDocument[]> {
    return this.model.find({ 
      isStoreActive: true, 
      isStoreSuspended: false,
      verificationStatus: 'approved'
    }).exec();
  }

  /**
   * Find stores by verification status
   */
  async findByVerificationStatus(status: 'pending' | 'approved' | 'rejected' | 'suspended'): Promise<StoreOwnerProfileDocument[]> {
    return this.model.find({ verificationStatus: status }).exec();
  }

  /**
   * Update store rating
   */
  async updateRating(storeId: string, rating: number, totalReviews: number): Promise<StoreOwnerProfileDocument | null> {
    return this.model.findByIdAndUpdate(
      storeId,
      { rating, totalReviews },
      { new: true }
    ).exec();
  }
}

