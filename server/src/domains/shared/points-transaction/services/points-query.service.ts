import {
  Injectable,
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
import { QueryPointsTransactionDto } from '../dto/query-points-transaction.dto';

/**
 * Service for querying points transactions
 */
@Injectable()
export class PointsQueryService {
  constructor(
    @InjectModel(PointsTransaction.name)
    private pointsTransactionModel: Model<PointsTransactionDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
  ) {}

  async getBalance(
    customerId: string,
  ): Promise<{ balance: number; tier: string }> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerProfileModel
      .findById(customerId)
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return {
      balance: customer.loyaltyPoints,
      tier: customer.tier,
    };
  }

  async findAll(queryDto: QueryPointsTransactionDto): Promise<{
    data: PointsTransactionDocument[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      customerId,
      type,
      orderId,
      isExpired,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    const filter: any = {};

    if (customerId) {
      if (!Types.ObjectId.isValid(customerId)) {
        throw new BadRequestException('Invalid customer ID');
      }
      filter.customerId = new Types.ObjectId(customerId);
    }

    if (type) filter.type = type;

    if (orderId) {
      if (!Types.ObjectId.isValid(orderId)) {
        throw new BadRequestException('Invalid order ID');
      }
      filter.orderId = new Types.ObjectId(orderId);
    }

    if (isExpired !== undefined) filter.isExpired = isExpired;

    if (search) filter.description = { $regex: search, $options: 'i' };

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

    return { data, total, page, limit };
  }

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

  async getExpiringPoints(
    customerId: string,
    daysAhead: number = 30,
  ): Promise<{
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

    return { expiringPoints, transactions };
  }
}
