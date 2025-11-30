import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from '../../../../database/schemas/audit-log.schema';

/**
 * Service for querying audit logs
 */
@Injectable()
export class AuditLogQueryService {
  private readonly logger = new Logger(AuditLogQueryService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

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
  }): Promise<{
    logs: AuditLogDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters?.performedBy)
      query.performedBy = new Types.ObjectId(filters.performedBy);
    if (filters?.action) query.action = new RegExp(filters.action, 'i');
    if (filters?.category) query.category = filters.category;
    if (filters?.targetId)
      query.targetId = new Types.ObjectId(filters.targetId);
    if (filters?.status) query.status = filters.status;

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
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

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<AuditLogDocument | null> {
    return this.auditLogModel
      .findById(id)
      .populate('performedBy', 'fullName phone email role')
      .exec();
  }

  async findByUser(
    userId: string,
    limit: number = 50,
  ): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ performedBy: new Types.ObjectId(userId) })
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTarget(
    targetId: string,
    limit: number = 50,
  ): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ targetId: new Types.ObjectId(targetId) })
      .populate('performedBy', 'fullName phone email role')
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCategory(
    category: string,
    limit: number = 50,
  ): Promise<AuditLogDocument[]> {
    return this.auditLogModel
      .find({ category })
      .populate('performedBy', 'fullName phone email role')
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();
  }

  async exportLogs(filters?: {
    performedBy?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLogDocument[]> {
    const query: any = {};

    if (filters?.performedBy)
      query.performedBy = new Types.ObjectId(filters.performedBy);
    if (filters?.category) query.category = filters.category;

    if (filters?.startDate || filters?.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    return this.auditLogModel
      .find(query)
      .populate('performedBy', 'fullName phone email role')
      .sort({ createdAt: -1 })
      .exec();
  }
}
