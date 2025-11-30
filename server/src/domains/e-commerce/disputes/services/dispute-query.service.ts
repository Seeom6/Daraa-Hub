import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  Dispute,
  DisputeStatus,
} from '../../../../database/schemas/dispute.schema';
import { QueryDisputeDto } from '../dto/query-dispute.dto';
import { DisputeRepository } from '../repositories/dispute.repository';

/**
 * Service for dispute query operations
 */
@Injectable()
export class DisputeQueryService {
  constructor(private readonly disputeRepository: DisputeRepository) {}

  async findAll(
    query: QueryDisputeDto,
  ): Promise<{ data: Dispute[]; meta: any }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;
    if (filters.priority) filter.priority = filters.priority;
    if (filters.orderId) filter.orderId = new Types.ObjectId(filters.orderId);
    if (filters.reportedBy)
      filter.reportedBy = new Types.ObjectId(filters.reportedBy);
    if (filters.assignedTo)
      filter.assignedTo = new Types.ObjectId(filters.assignedTo);

    const [data, total] = await Promise.all([
      this.disputeRepository
        .getModel()
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedBy', 'phone')
        .populate('reportedAgainst', 'phone')
        .populate('assignedTo', 'name'),
      this.disputeRepository.count(filter),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<Dispute> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid dispute ID');
    }

    const dispute = await this.disputeRepository
      .getModel()
      .findById(id)
      .populate('reportedBy', 'phone')
      .populate('reportedAgainst', 'phone')
      .populate('assignedTo', 'name');

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async findByUser(
    userId: string,
    query: QueryDisputeDto,
  ): Promise<{ data: Dispute[]; meta: any }> {
    const { page = 1, limit = 20, ...filters } = query;
    const skip = (page - 1) * limit;

    const filter: any = { reportedBy: new Types.ObjectId(userId) };
    if (filters.status) filter.status = filters.status;
    if (filters.type) filter.type = filters.type;

    const [data, total] = await Promise.all([
      this.disputeRepository
        .getModel()
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('reportedAgainst', 'phone')
        .populate('assignedTo', 'name'),
      this.disputeRepository.count(filter),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
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

    const stats = await this.disputeRepository.getModel().aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          open: {
            $sum: { $cond: [{ $eq: ['$status', DisputeStatus.OPEN] }, 1, 0] },
          },
          investigating: {
            $sum: {
              $cond: [{ $eq: ['$status', DisputeStatus.INVESTIGATING] }, 1, 0],
            },
          },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', DisputeStatus.RESOLVED] }, 1, 0],
            },
          },
          closed: {
            $sum: { $cond: [{ $eq: ['$status', DisputeStatus.CLOSED] }, 1, 0] },
          },
          escalated: {
            $sum: {
              $cond: [{ $eq: ['$status', DisputeStatus.ESCALATED] }, 1, 0],
            },
          },
        },
      },
    ]);

    return (
      stats[0] || {
        total: 0,
        open: 0,
        investigating: 0,
        resolved: 0,
        closed: 0,
        escalated: 0,
      }
    );
  }
}
