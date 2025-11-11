import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CourierProfile, CourierProfileDocument } from '../../../../database/schemas/courier-profile.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class CourierProfileRepository extends BaseRepository<CourierProfileDocument> {
  constructor(
    @InjectModel(CourierProfile.name) private readonly courierProfileModel: Model<CourierProfileDocument>,
  ) {
    super(courierProfileModel);
  }

  /**
   * Find courier profile by account ID
   */
  async findByAccountId(accountId: string): Promise<CourierProfileDocument | null> {
    return this.model.findOne({ accountId }).exec();
  }

  /**
   * Find available couriers
   */
  async findAvailableCouriers(): Promise<CourierProfileDocument[]> {
    return this.model.find({ 
      isAvailableForDelivery: true,
      isCourierSuspended: false,
      verificationStatus: 'approved',
      status: 'active'
    }).exec();
  }

  /**
   * Find couriers by verification status
   */
  async findByVerificationStatus(status: 'pending' | 'approved' | 'rejected' | 'suspended'): Promise<CourierProfileDocument[]> {
    return this.model.find({ verificationStatus: status }).exec();
  }

  /**
   * Update courier rating
   */
  async updateRating(courierId: string, rating: number, totalReviews: number): Promise<CourierProfileDocument | null> {
    return this.model.findByIdAndUpdate(
      courierId,
      { rating, totalReviews },
      { new: true }
    ).exec();
  }
}

