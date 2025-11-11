import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Referral, ReferralDocument, ReferralStatus, RewardType } from '../../../../database/schemas/referral.schema';
import { CustomerProfile, CustomerProfileDocument } from '../../../../database/schemas/customer-profile.schema';
import { CreateReferralDto } from '../dto/create-referral.dto';
import { ApplyReferralDto } from '../dto/apply-referral.dto';
import { QueryReferralDto } from '../dto/query-referral.dto';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);

  constructor(
    @InjectModel(Referral.name)
    private referralModel: Model<ReferralDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generate unique referral code
   */
  private async generateReferralCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let exists = true;

    while (exists) {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      const existing = await this.referralModel.findOne({ code }).exec();
      exists = !!existing;
    }

    return code;
  }

  /**
   * Create or get referral code for customer
   */
  async getOrCreateReferralCode(customerId: string): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    // Check if customer exists
    const customer = await this.customerProfileModel.findById(customerId).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if referral code already exists
    let referral = await this.referralModel.findOne({ referrerId: new Types.ObjectId(customerId) }).exec();

    if (!referral) {
      // Create new referral code with default rewards
      const code = await this.generateReferralCode();
      referral = await this.referralModel.create({
        referrerId: new Types.ObjectId(customerId),
        code,
        status: ReferralStatus.PENDING,
        reward: {
          referrerReward: {
            type: RewardType.POINTS,
            value: 100, // Default: 100 points for referrer
          },
          referredReward: {
            type: RewardType.POINTS,
            value: 50, // Default: 50 points for referred user
          },
        },
      });

      this.logger.log(`Referral code created: ${code} for customer ${customerId}`);
    }

    return referral;
  }

  /**
   * Apply referral code
   */
  async applyReferralCode(code: string, referredId: string): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(referredId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    // Check if referred customer exists
    const referredCustomer = await this.customerProfileModel.findById(referredId).exec();
    if (!referredCustomer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if customer already used a referral code
    const existingReferral = await this.referralModel.findOne({ referredId: new Types.ObjectId(referredId) }).exec();
    if (existingReferral) {
      throw new BadRequestException('You have already used a referral code');
    }

    // Find referral by code
    const referral = await this.referralModel.findOne({ code: code.toUpperCase() }).exec();
    if (!referral) {
      throw new NotFoundException('Invalid referral code');
    }

    // Check if customer is trying to use their own referral code
    if ((referral.referrerId as Types.ObjectId).toString() === referredId) {
      throw new BadRequestException('You cannot use your own referral code');
    }

    // Check if customer has made any orders (should be new user)
    if (referredCustomer.orders.length > 0) {
      throw new BadRequestException('Referral codes can only be used by new users');
    }

    // Update referral with referred user
    referral.referredId = new Types.ObjectId(referredId);
    await referral.save();

    this.logger.log(`Referral code applied: ${code} by customer ${referredId}`);

    this.eventEmitter.emit('referral.applied', {
      referralId: (referral._id as Types.ObjectId).toString(),
      referrerId: (referral.referrerId as Types.ObjectId).toString(),
      referredId,
      code,
    });

    return referral;
  }

  /**
   * Complete referral (when referred user makes first order)
   */
  async completeReferral(referredId: string, orderId: string): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(referredId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const referral = await this.referralModel.findOne({ referredId: new Types.ObjectId(referredId) }).exec();
    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    if (referral.status !== ReferralStatus.PENDING) {
      throw new BadRequestException('Referral already completed');
    }

    referral.status = ReferralStatus.COMPLETED;
    referral.completedAt = new Date();
    referral.firstOrderId = new Types.ObjectId(orderId);
    await referral.save();

    this.logger.log(`Referral completed: ${referral.code} for order ${orderId}`);

    this.eventEmitter.emit('referral.completed', {
      referralId: (referral._id as Types.ObjectId).toString(),
      referrerId: (referral.referrerId as Types.ObjectId).toString(),
      referredId,
      orderId,
    });

    return referral;
  }

  /**
   * Distribute rewards
   */
  async distributeRewards(referralId: string): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(referralId)) {
      throw new BadRequestException('Invalid referral ID');
    }

    const referral = await this.referralModel.findById(referralId).exec();
    if (!referral) {
      throw new NotFoundException('Referral not found');
    }

    if (referral.status !== ReferralStatus.COMPLETED) {
      throw new BadRequestException('Referral must be completed before distributing rewards');
    }

    // Get referrer and referred customers
    const [referrer, referred] = await Promise.all([
      this.customerProfileModel.findById(referral.referrerId).exec(),
      this.customerProfileModel.findById(referral.referredId).exec(),
    ]);

    if (!referrer || !referred) {
      throw new NotFoundException('Customer not found');
    }

    // Distribute rewards based on type
    if (referral.reward.referrerReward.type === RewardType.POINTS) {
      referrer.loyaltyPoints += referral.reward.referrerReward.value;
      await referrer.save();

      // Emit event to create points transaction
      this.eventEmitter.emit('points.award', {
        customerId: (referral.referrerId as Types.ObjectId).toString(),
        amount: referral.reward.referrerReward.value,
        description: `Referral reward for referring ${referred.accountId}`,
      });
    }

    if (referral.reward.referredReward.type === RewardType.POINTS) {
      referred.loyaltyPoints += referral.reward.referredReward.value;
      await referred.save();

      // Emit event to create points transaction
      this.eventEmitter.emit('points.award', {
        customerId: (referral.referredId as Types.ObjectId).toString(),
        amount: referral.reward.referredReward.value,
        description: `Referral reward for using code ${referral.code}`,
      });
    }

    // Update referral status
    referral.status = ReferralStatus.REWARDED;
    referral.rewardedAt = new Date();
    await referral.save();

    this.logger.log(`Rewards distributed for referral: ${referral.code}`);

    this.eventEmitter.emit('referral.rewarded', {
      referralId: (referral._id as Types.ObjectId).toString(),
      referrerId: (referral.referrerId as Types.ObjectId).toString(),
      referredId: (referral.referredId as Types.ObjectId).toString(),
    });

    return referral;
  }

  /**
   * Get all referrals with filters
   */
  async findAll(queryDto: QueryReferralDto): Promise<{
    data: ReferralDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { referrerId, referredId, status, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

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

    return {
      data,
      total,
      page,
      limit,
    };
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

    const referrals = await this.referralModel.find({ referrerId: new Types.ObjectId(customerId) }).exec();

    const totalReferrals = referrals.filter(r => r.referredId).length;
    const completedReferrals = referrals.filter(r => r.status === ReferralStatus.COMPLETED || r.status === ReferralStatus.REWARDED).length;
    const pendingReferrals = referrals.filter(r => r.status === ReferralStatus.PENDING && r.referredId).length;
    const totalRewardsEarned = referrals
      .filter(r => r.status === ReferralStatus.REWARDED)
      .reduce((sum, r) => sum + r.reward.referrerReward.value, 0);

    return {
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalRewardsEarned,
    };
  }
}

