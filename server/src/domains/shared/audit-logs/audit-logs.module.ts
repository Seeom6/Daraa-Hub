import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  AuditLog,
  AuditLogSchema,
} from '../../../database/schemas/audit-log.schema';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { AuditLogsService } from './services/audit-logs.service';
import { AuditLogWriterService } from './services/audit-log-writer.service';
import { AuditLogQueryService } from './services/audit-log-query.service';
import { AuditLogStatsService } from './services/audit-log-stats.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { AuditLogRepository } from './repositories/audit-log.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuditLogsController],
  providers: [
    // Specialized Services
    AuditLogWriterService,
    AuditLogQueryService,
    AuditLogStatsService,
    // Facade Service
    AuditLogsService,
    // Interceptor & Repository
    AuditLogInterceptor,
    AuditLogRepository,
  ],
  exports: [
    AuditLogsService,
    AuditLogWriterService,
    AuditLogQueryService,
    AuditLogStatsService,
    AuditLogInterceptor,
    AuditLogRepository,
  ],
})
export class AuditLogsModule {}
