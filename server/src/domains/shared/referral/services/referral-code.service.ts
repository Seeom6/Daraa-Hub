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
 * Service for referral code operations
 * Handles code generation, creation, and application
 */
@Injectable()
export class ReferralCodeService {
  private readonly logger = new Logger(ReferralCodeService.name);

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
  async generateReferralCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let exists = true;

    while (exists) {
      code = '';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
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

    const customer = await this.customerProfileModel
      .findById(customerId)
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let referral = await this.referralModel
      .findOne({ referrerId: new Types.ObjectId(customerId) })
      .exec();

    if (!referral) {
      const code = await this.generateReferralCode();
      referral = await this.referralModel.create({
        referrerId: new Types.ObjectId(customerId),
        code,
        status: ReferralStatus.PENDING,
        reward: {
          referrerReward: { type: RewardType.POINTS, value: 100 },
          referredReward: { type: RewardType.POINTS, value: 50 },
        },
      });

      this.logger.log(
        `Referral code created: ${code} for customer ${customerId}`,
      );
    }

    return referral;
  }

  /**
   * Apply referral code
   */
  async applyReferralCode(
    code: string,
    referredId: string,
  ): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(referredId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const referredCustomer = await this.customerProfileModel
      .findById(referredId)
      .exec();
    if (!referredCustomer) {
      throw new NotFoundException('Customer not found');
    }

    const existingReferral = await this.referralModel
      .findOne({ referredId: new Types.ObjectId(referredId) })
      .exec();
    if (existingReferral) {
      throw new BadRequestException('You have already used a referral code');
    }

    const referral = await this.referralModel
      .findOne({ code: code.toUpperCase() })
      .exec();
    if (!referral) {
      throw new NotFoundException('Invalid referral code');
    }

    if (referral.referrerId.toString() === referredId) {
      throw new BadRequestException('You cannot use your own referral code');
    }

    if (referredCustomer.orders.length > 0) {
      throw new BadRequestException(
        'Referral codes can only be used by new users',
      );
    }

    referral.referredId = new Types.ObjectId(referredId);
    await referral.save();

    this.logger.log(`Referral code applied: ${code} by customer ${referredId}`);

    this.eventEmitter.emit('referral.applied', {
      referralId: (referral._id as Types.ObjectId).toString(),
      referrerId: referral.referrerId.toString(),
      referredId,
      code,
    });

    return referral;
  }

  /**
   * Complete referral (when referred user makes first order)
   */
  async completeReferral(
    referredId: string,
    orderId: string,
  ): Promise<ReferralDocument> {
    if (!Types.ObjectId.isValid(referredId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const referral = await this.referralModel
      .findOne({ referredId: new Types.ObjectId(referredId) })
      .exec();
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

    this.logger.log(
      `Referral completed: ${referral.code} for order ${orderId}`,
    );

    this.eventEmitter.emit('referral.completed', {
      referralId: (referral._id as Types.ObjectId).toString(),
      referrerId: referral.referrerId.toString(),
      referredId,
      orderId,
    });

    return referral;
  }
}
