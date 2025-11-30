import { Injectable, Logger } from '@nestjs/common';
import { AuditLogDocument } from '../../../../database/schemas/audit-log.schema';
import { CreateAuditLogDto } from '../dto/create-audit-log.dto';
import { AuditLogWriterService } from './audit-log-writer.service';
import { AuditLogQueryService } from './audit-log-query.service';
import { AuditLogStatsService } from './audit-log-stats.service';

/**
 * Audit Logs Service - Facade Pattern
 * Delegates to specialized services: AuditLogWriterService, AuditLogQueryService, AuditLogStatsService
 */
@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(
    private readonly writerService: AuditLogWriterService,
    private readonly queryService: AuditLogQueryService,
    private readonly statsService: AuditLogStatsService,
  ) {}

  // ==================== Write Operations (delegated to WriterService) ====================

  async create(
    createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLogDocument> {
    return this.writerService.create(createAuditLogDto);
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
    return this.writerService.log(
      performedBy,
      action,
      category,
      actionType,
      ipAddress,
      options,
    );
  }

  async deleteOldLogs(daysToKeep: number = 365): Promise<number> {
    return this.writerService.deleteOldLogs(daysToKeep);
  }

  // ==================== Query Operations (delegated to QueryService) ====================

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
  }) {
    return this.queryService.findAll(filters);
  }

  async findById(id: string): Promise<AuditLogDocument | null> {
    return this.queryService.findById(id);
  }

  async findByUser(
    userId: string,
    limit: number = 50,
  ): Promise<AuditLogDocument[]> {
    return this.queryService.findByUser(userId, limit);
  }

  async findByTarget(
    targetId: string,
    limit: number = 50,
  ): Promise<AuditLogDocument[]> {
    return this.queryService.findByTarget(targetId, limit);
  }

  async findByCategory(
    category: string,
    limit: number = 50,
  ): Promise<AuditLogDocument[]> {
    return this.queryService.findByCategory(category, limit);
  }

  async exportLogs(filters?: {
    performedBy?: string;
    category?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<AuditLogDocument[]> {
    return this.queryService.exportLogs(filters);
  }

  // ==================== Statistics (delegated to StatsService) ====================

  async getStatistics(filters?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<any> {
    return this.statsService.getStatistics(filters);
  }
}
