import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PointsTransaction, PointsTransactionDocument, TransactionType } from '../../../../database/schemas/points-transaction.schema';
import { CustomerProfile, CustomerProfileDocument } from '../../../../database/schemas/customer-profile.schema';
import { CreatePointsTransactionDto } from '../dto/create-points-transaction.dto';
import { QueryPointsTransactionDto } from '../dto/query-points-transaction.dto';
import { RedeemPointsDto } from '../dto/redeem-points.dto';

@Injectable()
export class PointsTransactionService {
  private readonly logger = new Logger(PointsTransactionService.name);

  constructor(
    @InjectModel(PointsTransaction.name)
    private pointsTransactionModel: Model<PointsTransactionDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a points transaction
   */
  async create(createDto: CreatePointsTransactionDto): Promise<PointsTransactionDocument> {
    if (!Types.ObjectId.isValid(createDto.customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerProfileModel.findById(createDto.customerId).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const balanceBefore = customer.loyaltyPoints;
    const balanceAfter = balanceBefore + createDto.amount;

    if (balanceAfter < 0) {
      throw new BadRequestException('Insufficient points balance');
    }

    // Create transaction
    const transaction = await this.pointsTransactionModel.create({
      ...createDto,
      customerId: new Types.ObjectId(createDto.customerId),
      orderId: createDto.orderId ? new Types.ObjectId(createDto.orderId) : undefined,
      balanceBefore,
      balanceAfter,
    });

    // Update customer balance
    customer.loyaltyPoints = balanceAfter;
    await customer.save();

    this.logger.log(`Points transaction created: ${transaction._id} for customer ${createDto.customerId}`);

    // Emit event
    this.eventEmitter.emit('points.transaction.created', {
      transactionId: (transaction._id as Types.ObjectId).toString(),
      customerId: createDto.customerId,
      type: createDto.type,
      amount: createDto.amount,
      balanceAfter,
    });

    return transaction;
  }

  /**
   * Get customer's points balance
   */
  async getBalance(customerId: string): Promise<{ balance: number; tier: string }> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerProfileModel.findById(customerId).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      balance: customer.loyaltyPoints,
      tier: customer.tier,
    };
  }

  /**
   * Get customer's transaction history
   */
  async findAll(queryDto: QueryPointsTransactionDto): Promise<{
    data: PointsTransactionDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { customerId, type, orderId, isExpired, search, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = queryDto;

    const filter: any = {};

    if (customerId) {
      if (!Types.ObjectId.isValid(customerId)) {
        throw new BadRequestException('Invalid customer ID');
      }
      filter.customerId = new Types.ObjectId(customerId);
    }

    if (type) {
      filter.type = type;
    }

    if (orderId) {
      if (!Types.ObjectId.isValid(orderId)) {
        throw new BadRequestException('Invalid order ID');
      }
      filter.orderId = new Types.ObjectId(orderId);
    }

    if (isExpired !== undefined) {
      filter.isExpired = isExpired;
    }

    if (search) {
      filter.description = { $regex: search, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      this.pointsTransactionModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'accountId tier loyaltyPoints')
        .populate('orderId', 'orderNumber total')
        .exec(),
      this.pointsTransactionModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get transaction by ID
   */
  async findOne(id: string): Promise<PointsTransactionDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid transaction ID');
    }

    const transaction = await this.pointsTransactionModel
      .findById(id)
      .populate('customerId', 'accountId tier loyaltyPoints')
      .populate('orderId', 'orderNumber total')
      .exec();

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Redeem points
   */
  async redeemPoints(customerId: string, redeemDto: RedeemPointsDto): Promise<PointsTransactionDocument> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerProfileModel.findById(customerId).exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (customer.loyaltyPoints < redeemDto.points) {
      throw new BadRequestException('Insufficient points balance');
    }

    const transaction = await this.create({
      customerId,
      type: TransactionType.SPENT,
      amount: -redeemDto.points,
      description: redeemDto.description,
    });

    this.logger.log(`Points redeemed: ${redeemDto.points} for customer ${customerId}`);

    return transaction;
  }

  /**
   * Award points (for orders, referrals, etc.)
   */
  async awardPoints(
    customerId: string,
    amount: number,
    description: string,
    orderId?: string,
    expiresAt?: Date,
  ): Promise<PointsTransactionDocument> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const transaction = await this.create({
      customerId,
      type: TransactionType.EARNED,
      amount,
      description,
      orderId,
      expiresAt,
    });

    this.logger.log(`Points awarded: ${amount} to customer ${customerId}`);

    return transaction;
  }

  /**
   * Get expiring points
   */
  async getExpiringPoints(customerId: string, daysAhead: number = 30): Promise<{
    expiringPoints: number;
    transactions: PointsTransactionDocument[];
  }> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + daysAhead);

    const transactions = await this.pointsTransactionModel
      .find({
        customerId: new Types.ObjectId(customerId),
        type: TransactionType.EARNED,
        isExpired: false,
        expiresAt: { $lte: expiryDate, $gte: new Date() },
      })
      .sort({ expiresAt: 1 })
      .exec();

    const expiringPoints = transactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      expiringPoints,
      transactions,
    };
  }

  /**
   * Expire points (to be called by cron job)
   */
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
      // Mark as expired
      transaction.isExpired = true;
      await transaction.save();

      // Create expiration transaction
      await this.create({
        customerId: (transaction.customerId as Types.ObjectId).toString(),
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

