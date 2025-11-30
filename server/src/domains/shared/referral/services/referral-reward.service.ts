import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  Referral,
  ReferralDocument,
  ReferralStatus,
  RewardType,
} from '../../../../database/schemas/referral.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../../database/schemas/customer-profile.schema';

/**
 * Service for referral reward operations
 * Handles reward distribution and tracking
 */
@Injectable()
export class ReferralRewardService {
  private readonly logger = new Logger(ReferralRewardService.name);

  constructor(
    @InjectModel(Referral.name)
    private referralModel: Model<ReferralDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Distribute rewards for a completed referral
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
      throw new BadRequestException(
        'Referral must be completed before distributing rewards',
      );
    }

    const [referrer, referred] = await Promise.all([
      this.customerProfileModel.findById(referral.referrerId).exec(),
      this.customerProfileModel.findById(referral.referredId).exec(),
    ]);

    if (!referrer || !referred) {
      throw new NotFoundException('Customer not found');
    }

    // Distribute referrer reward
    if (referral.reward.referrerReward.type === RewardType.POINTS) {
      referrer.loyaltyPoints += referral.reward.referrerReward.value;
      await referrer.save();

      this.eventEmitter.emit('points.award', {
        customerId: referral.referrerId.toString(),
        amount: referral.reward.referrerReward.value,
        description: `Referral reward for referring ${referred.accountId}`,
      });
    }

    // Distribute referred reward
    if (referral.reward.referredReward.type === RewardType.POINTS) {
      referred.loyaltyPoints += referral.reward.referredReward.value;
      await referred.save();

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
      referrerId: referral.referrerId.toString(),
      referredId: (referral.referredId as Types.ObjectId).toString(),
    });

    return referral;
  }

  /**
   * Get total rewards earned by a customer
   */
  async getTotalRewardsEarned(customerId: string): Promise<number> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const referrals = await this.referralModel
      .find({
        referrerId: new Types.ObjectId(customerId),
        status: ReferralStatus.REWARDED,
      })
      .exec();

    return referrals.reduce((sum, r) => sum + r.reward.referrerReward.value, 0);
  }
}
