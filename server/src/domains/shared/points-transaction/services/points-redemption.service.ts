import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PointsTransaction,
  PointsTransactionDocument,
  TransactionType,
} from '../../../../database/schemas/points-transaction.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../../database/schemas/customer-profile.schema';
import { RedeemPointsDto } from '../dto/redeem-points.dto';
import { PointsEarningService } from './points-earning.service';

/**
 * Service for redeeming and expiring points
 */
@Injectable()
export class PointsRedemptionService {
  private readonly logger = new Logger(PointsRedemptionService.name);

  constructor(
    @InjectModel(PointsTransaction.name)
    private pointsTransactionModel: Model<PointsTransactionDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private earningService: PointsEarningService,
  ) {}

  async redeemPoints(
    customerId: string,
    redeemDto: RedeemPointsDto,
  ): Promise<PointsTransactionDocument> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerProfileModel
      .findById(customerId)
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.loyaltyPoints < redeemDto.points) {
      throw new BadRequestException('Insufficient points balance');
    }

    const transaction = await this.earningService.create({
      customerId,
      type: TransactionType.SPENT,
      amount: -redeemDto.points,
      description: redeemDto.description,
    });

    this.logger.log(
      `Points redeemed: ${redeemDto.points} for customer ${customerId}`,
    );

    return transaction;
  }

  async expirePoints(): Promise<number> {
    const now = new Date();

    const expiredTransactions = await this.pointsTransactionModel
      .find({
        type: TransactionType.EARNED,
        isExpired: false,
        expiresAt: { $lte: now },
      })
      .exec();

    let totalExpired = 0;

    for (const transaction of expiredTransactions) {
      transaction.isExpired = true;
      await transaction.save();

      await this.earningService.create({
        customerId: transaction.customerId.toString(),
        type: TransactionType.EXPIRED,
        amount: -transaction.amount,
        description: `Points expired from transaction ${transaction._id}`,
      });

      totalExpired++;
    }

    this.logger.log(`Expired ${totalExpired} point transactions`);

    return totalExpired;
  }
}
