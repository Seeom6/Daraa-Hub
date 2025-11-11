import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Referral,
  ReferralDocument,
} from '../../../../database/schemas/referral.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class ReferralRepository extends BaseRepository<ReferralDocument> {
  constructor(
    @InjectModel(Referral.name)
    private readonly referralModel: Model<ReferralDocument>,
  ) {
    super(referralModel);
  }

  /**
   * Find referrals by referrer ID
   */
  async findByReferrerId(
    referrerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: ReferralDocument[]; total: number }> {
    return this.findWithPagination(
      { referrerId: new Types.ObjectId(referrerId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find referral by referred user ID
   */
  async findByReferredId(referredId: string): Promise<ReferralDocument | null> {
    return this.findOne({ referredUserId: new Types.ObjectId(referredId) });
  }

  /**
   * Find referral by code
   */
  async findByCode(code: string): Promise<ReferralDocument | null> {
    return this.findOne({ referralCode: code });
  }

  /**
   * Get referral statistics for user
   */
  async getReferralStats(referrerId: string): Promise<any> {
    return this.referralModel.aggregate([
      {
        $match: { referrerId: new Types.ObjectId(referrerId) },
      },
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: 1 },
          completedReferrals: {
            $sum: { $cond: ['$isCompleted', 1, 0] },
          },
          totalRewards: { $sum: '$rewardAmount' },
        },
      },
    ]);
  }

  /**
   * Mark referral as completed
   */
  async markAsCompleted(
    referralId: string,
    rewardAmount: number,
  ): Promise<ReferralDocument | null> {
    return this.findByIdAndUpdate(referralId, {
      isCompleted: true,
      completedAt: new Date(),
      rewardAmount,
    });
  }

  /**
   * Get top referrers
   */
  async getTopReferrers(limit: number = 10): Promise<any[]> {
    return this.referralModel.aggregate([
      {
        $group: {
          _id: '$referrerId',
          totalReferrals: { $sum: 1 },
          completedReferrals: {
            $sum: { $cond: ['$isCompleted', 1, 0] },
          },
          totalRewards: { $sum: '$rewardAmount' },
        },
      },
      {
        $sort: { completedReferrals: -1 },
      },
      {
        $limit: limit,
      },
    ]);
  }
}

