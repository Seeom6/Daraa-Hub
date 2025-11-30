import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  Return,
  ReturnStatus,
} from '../../../../database/schemas/return.schema';
import { QueryReturnDto } from '../dto/query-return.dto';
import { ReturnRepository } from '../repositories/return.repository';

/**
 * Service for return query operations
 * Handles search, listing, and statistics
 */
@Injectable()
export class ReturnQueryService {
  constructor(private readonly returnRepository: ReturnRepository) {}

  async findAll(query: QueryReturnDto): Promise<{ data: Return[]; meta: any }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    if (filters.orderId) filter.orderId = new Types.ObjectId(filters.orderId);
    if (filters.customerId)
      filter.customerId = new Types.ObjectId(filters.customerId);

    const [data, total] = await Promise.all([
      this.returnRepository
        .getModel()
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'name phone')
        .populate('items.productId', 'name'),
      this.returnRepository.count(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string): Promise<Return> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid return ID');
    }

    const returnRequest = await this.returnRepository
      .getModel()
      .findById(id)
      .populate('customerId', 'name phone')
      .populate('items.productId', 'name price');

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    return returnRequest;
  }

  async findByCustomer(
    customerId: string,
    query: QueryReturnDto,
  ): Promise<{ data: Return[]; meta: any }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const filter: any = {
      customerId: new Types.ObjectId(customerId),
    };
    if (filters.status) filter.status = filters.status;

    const [data, total] = await Promise.all([
      this.returnRepository
        .getModel()
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('items.productId', 'name price'),
      this.returnRepository.count(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStatistics(filters?: any): Promise<any> {
    const matchStage: any = {};
    if (filters?.startDate || filters?.endDate) {
      matchStage.createdAt = {};
      if (filters.startDate)
        matchStage.createdAt.$gte = new Date(filters.startDate);
      if (filters.endDate)
        matchStage.createdAt.$lte = new Date(filters.endDate);
    }

    const stats = await this.returnRepository.getModel().aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          requested: {
            $sum: {
              $cond: [{ $eq: ['$status', ReturnStatus.REQUESTED] }, 1, 0],
            },
          },
          approved: {
            $sum: {
              $cond: [{ $eq: ['$status', ReturnStatus.APPROVED] }, 1, 0],
            },
          },
          rejected: {
            $sum: {
              $cond: [{ $eq: ['$status', ReturnStatus.REJECTED] }, 1, 0],
            },
          },
          pickedUp: {
            $sum: {
              $cond: [{ $eq: ['$status', ReturnStatus.PICKED_UP] }, 1, 0],
            },
          },
          inspected: {
            $sum: {
              $cond: [{ $eq: ['$status', ReturnStatus.INSPECTED] }, 1, 0],
            },
          },
          refunded: {
            $sum: {
              $cond: [{ $eq: ['$status', ReturnStatus.REFUNDED] }, 1, 0],
            },
          },
          totalRefundAmount: { $sum: '$refundAmount' },
        },
      },
    ]);

    return (
      stats[0] || {
        total: 0,
        requested: 0,
        approved: 0,
        rejected: 0,
        pickedUp: 0,
        inspected: 0,
        refunded: 0,
        totalRefundAmount: 0,
      }
    );
  }
}
