import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AuditLog,
  AuditLogDocument,
} from '../../../../database/schemas/audit-log.schema';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';

/**
 * Service for creating audit log entries
 */
@Injectable()
export class AuditLogWriterService {
  private readonly logger = new Logger(AuditLogWriterService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLogDocument>,
  ) {}

  async create(
    createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLogDocument> {
    try {
      const auditLog = new this.auditLogModel({
        ...createAuditLogDto,
        performedBy: new Types.ObjectId(createAuditLogDto.performedBy),
        targetId: createAuditLogDto.targetId
          ? new Types.ObjectId(createAuditLogDto.targetId)
          : undefined,
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

  async deleteOldLogs(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.auditLogModel
      .deleteMany({ createdAt: { $lt: cutoffDate } })
      .exec();

    this.logger.log(
      `Deleted ${result.deletedCount} old audit logs (older than ${daysToKeep} days)`,
    );
    return result.deletedCount;
  }
}
