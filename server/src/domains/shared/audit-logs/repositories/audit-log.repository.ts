import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from '../../../../database/schemas/audit-log.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class AuditLogRepository extends BaseRepository<AuditLogDocument> {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {
    super(auditLogModel);
  }

  /**
   * Find logs by user ID
   */
  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLogDocument[]; total: number }> {
    return this.findWithPagination(
      { userId: new Types.ObjectId(userId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find logs by action
   */
  async findByAction(
    action: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLogDocument[]; total: number }> {
    return this.findWithPagination(
      { action },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find logs by entity
   */
  async findByEntity(
    entityType: string,
    entityId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLogDocument[]; total: number }> {
    return this.findWithPagination(
      {
        entityType,
        entityId: new Types.ObjectId(entityId),
      },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find logs by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: AuditLogDocument[]; total: number }> {
    return this.findWithPagination(
      {
        createdAt: { $gte: startDate, $lte: endDate },
      },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Delete old logs
   */
  async deleteOldLogs(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.auditLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }

  /**
   * Get activity summary
   */
  async getActivitySummary(userId?: string): Promise<any[]> {
    const match: any = {};
    if (userId) {
      match.userId = new Types.ObjectId(userId);
    }

    return this.auditLogModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastActivity: { $max: '$createdAt' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  }
}

