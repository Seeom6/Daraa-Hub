import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Referral,
  ReferralDocument,
  ReferralStatus,
} from '../../../../database/schemas/referral.schema';
import { QueryReferralDto } from '../dto/query-referral.dto';

/**
 * Service for referral query operations
 * Handles search, filtering, and statistics
 */
@Injectable()
export class ReferralQueryService {
  constructor(
    @InjectModel(Referral.name)
    private referralModel: Model<ReferralDocument>,
  ) {}

  /**
   * Get all referrals with filters
   */
  async findAll(queryDto: QueryReferralDto): Promise<{
    data: ReferralDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      referrerId,
      referredId,
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    if (referrerId) {
      if (!Types.ObjectId.isValid(referrerId)) {
        throw new BadRequestException('Invalid referrer ID');
      }
      filter.referrerId = new Types.ObjectId(referrerId);
    }

    if (referredId) {
      if (!Types.ObjectId.isValid(referredId)) {
        throw new BadRequestException('Invalid referred ID');
      }
      filter.referredId = new Types.ObjectId(referredId);
    }

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.code = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.referralModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('referrerId', 'accountId tier loyaltyPoints')
        .populate('referredId', 'accountId tier loyaltyPoints')
        .populate('firstOrderId', 'orderNumber total')
        .exec(),
      this.referralModel.countDocuments(filter).exec(),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get referral by ID
   */
  async findOne(id: string): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid referral ID');
    }

    const referral = await this.referralModel
      .findById(id)
      .populate('referrerId', 'accountId tier loyaltyPoints')
      .populate('referredId', 'accountId tier loyaltyPoints')
      .populate('firstOrderId', 'orderNumber total')
      .exec();

    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    return referral;
  }

  /**
   * Get referral statistics for customer
   */
  async getReferralStats(customerId: string): Promise<{
    totalReferrals: number;
    completedReferrals: number;
    pendingReferrals: number;
    totalRewardsEarned: number;
  }> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const referrals = await this.referralModel
      .find({ referrerId: new Types.ObjectId(customerId) })
      .exec();

    const totalReferrals = referrals.filter((r) => r.referredId).length;
    const completedReferrals = referrals.filter(
      (r) =>
        r.status === ReferralStatus.COMPLETED ||
        r.status === ReferralStatus.REWARDED,
    ).length;
    const pendingReferrals = referrals.filter(
      (r) => r.status === ReferralStatus.PENDING && r.referredId,
    ).length;
    const totalRewardsEarned = referrals
      .filter((r) => r.status === ReferralStatus.REWARDED)
      .reduce((sum, r) => sum + r.reward.referrerReward.value, 0);

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalRewardsEarned,
    };
  }
}
