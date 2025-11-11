import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from '../../database/schemas/audit-log.schema';
import { AuditLogsController } from './controllers/audit-logs.controller';
import { AuditLogsService } from './services/audit-logs.service';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  controllers: [AuditLogsController],
  providers: [AuditLogsService, AuditLogInterceptor],
  exports: [AuditLogsService, AuditLogInterceptor],
})
export class AuditLogsModule {}

