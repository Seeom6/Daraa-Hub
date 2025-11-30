import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from '../../../../database/schemas/audit-log.schema';

/**
 * Service for audit log statistics and analytics
 */
@Injectable()
export class AuditLogStatsService {
  private readonly logger = new Logger(AuditLogStatsService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const query: any = {};

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const [totalLogs, byCategory, byActionType, byStatus, topUsers] =
      await Promise.all([
        this.auditLogModel.countDocuments(query).exec(),
        this.auditLogModel
          .aggregate([
            { $match: query },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ])
          .exec(),
        this.auditLogModel
          .aggregate([
            { $match: query },
            { $group: { _id: '$actionType', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ])
          .exec(),
        this.auditLogModel
          .aggregate([
            { $match: query },
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ])
          .exec(),
        this.auditLogModel
          .aggregate([
            { $match: query },
            { $group: { _id: '$performedBy', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'accounts',
                localField: '_id',
                foreignField: '_id',
                as: 'user',
              },
            },
            { $unwind: '$user' },
            {
              $project: {
                userId: '$_id',
                count: 1,
                fullName: '$user.fullName',
                phone: '$user.phone',
                role: '$user.role',
              },
            },
          ])
          .exec(),
      ]);

    return { totalLogs, byCategory, byActionType, byStatus, topUsers };
  }
}
