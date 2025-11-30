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
  PointsTransaction,
  PointsTransactionDocument,
  TransactionType,
} from '../../../../database/schemas/points-transaction.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../../database/schemas/customer-profile.schema';
import { CreatePointsTransactionDto } from '../dto/create-points-transaction.dto';

/**
 * Service for earning and awarding points
 */
@Injectable()
export class PointsEarningService {
  private readonly logger = new Logger(PointsEarningService.name);

  constructor(
    @InjectModel(PointsTransaction.name)
    private pointsTransactionModel: Model<PointsTransactionDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(
    createDto: CreatePointsTransactionDto,
  ): Promise<PointsTransactionDocument> {
    if (!Types.ObjectId.isValid(createDto.customerId)) {
      throw new BadRequestException('Invalid customer ID');
    }

    const customer = await this.customerProfileModel
      .findById(createDto.customerId)
      .exec();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const balanceBefore = customer.loyaltyPoints;
    const balanceAfter = balanceBefore + createDto.amount;

    if (balanceAfter < 0) {
      throw new BadRequestException('Insufficient points balance');
    }

    const transaction = await this.pointsTransactionModel.create({
      ...createDto,
      customerId: new Types.ObjectId(createDto.customerId),
      orderId: createDto.orderId
        ? new Types.ObjectId(createDto.orderId)
        : undefined,
      balanceBefore,
      balanceAfter,
    });

    customer.loyaltyPoints = balanceAfter;
    await customer.save();

    this.logger.log(
      `Points transaction created: ${transaction._id} for customer ${createDto.customerId}`,
    );

    this.eventEmitter.emit('points.transaction.created', {
      transactionId: (transaction._id as Types.ObjectId).toString(),
      customerId: createDto.customerId,
      type: createDto.type,
      amount: createDto.amount,
      balanceAfter,
    });

    return transaction;
  }

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
}
