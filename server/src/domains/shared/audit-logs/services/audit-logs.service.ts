import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../../../../database/schemas/audit-log.schema';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(createAuditLogDto: CreateAuditLogDto): Promise<AuditLogDocument> {
    try {
      const auditLog = new this.auditLogModel({
        ...createAuditLogDto,
        performedBy: new Types.ObjectId(createAuditLogDto.performedBy),
        targetId: createAuditLogDto.targetId ? new Types.ObjectId(createAuditLogDto.targetId) : undefined,
      });

      return await auditLog.save();
    } catch (error) {
      this.logger.error('Failed to create audit log', error);
      throw error;
    }
  }

  async log(
    performedBy: string,
    action: string,
    category: string,
    actionType: string,
    ipAddress: string,
    options?: {
      targetId?: string;
      targetModel?: string;
      metadata?: Record<string, any>;
      changes?: { before?: any; after?: any };
      userAgent?: string;
      status?: 'success' | 'failure' | 'warning';
      errorMessage?: string;
      description?: string;
    },
  ): Promise<AuditLogDocument> {
    return this.create({
      performedBy,
      action,
      category: category as any,
      actionType: actionType as any,
      ipAddress,
      ...options,
    });
  }

  async findAll(filters?: {
    performedBy?: string;
    action?: string;
    category?: string;
    targetId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ logs: AuditLogDocument[]; total: number; page: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters?.performedBy) {
      query.performedBy = new Types.ObjectId(filters.performedBy);
    }

    if (filters?.action) {
      query.action = new RegExp(filters.action, 'i');
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.targetId) {
      query.targetId = new Types.ObjectId(filters.targetId);
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(query)
        .populate('performedBy', 'fullName phone email role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.auditLogModel.countDocuments(query).exec(),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<AuditLogDocument | null> {
    return this.auditLogModel
      .findById(id)
      .populate('performedBy', 'fullName phone email role')
      .exec();
  }

  async findByUser(userId: string, limit: number = 50): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ performedBy: new Types.ObjectId(userId) })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTarget(targetId: string, limit: number = 50): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ targetId: new Types.ObjectId(targetId) })
      .populate('performedBy', 'fullName phone email role')
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCategory(category: string, limit: number = 50): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ category })
      .populate('performedBy', 'fullName phone email role')
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    const query: any = {};

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    const [
      totalLogs,
      byCategory,
      byActionType,
      byStatus,
      topUsers,
    ] = await Promise.all([
      this.auditLogModel.countDocuments(query).exec(),
      this.auditLogModel.aggregate([
        { $match: query },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).exec(),
      this.auditLogModel.aggregate([
        { $match: query },
        { $group: { _id: '$actionType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).exec(),
      this.auditLogModel.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]).exec(),
      this.auditLogModel.aggregate([
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
      ]).exec(),
    ]);

    return {
      totalLogs,
      byCategory,
      byActionType,
      byStatus,
      topUsers,
    };
  }

  async deleteOldLogs(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogModel.deleteMany({
      createdAt: { $lt: cutoffDate },
    }).exec();

    this.logger.log(`Deleted ${result.deletedCount} old audit logs (older than ${daysToKeep} days)`);
    return result.deletedCount;
  }

  async exportLogs(filters?: {
    performedBy?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLogDocument[]> {
    const query: any = {};

    if (filters?.performedBy) {
      query.performedBy = new Types.ObjectId(filters.performedBy);
    }

    if (filters?.category) {
      query.category = filters.category;
    }

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) {
        query.createdAt.$gte = filters.startDate;
      }
      if (filters.endDate) {
        query.createdAt.$lte = filters.endDate;
      }
    }

    return this.auditLogModel
      .find(query)
      .populate('performedBy', 'fullName phone email role')
      .sort({ createdAt: -1 })
      .exec();
  }
}

