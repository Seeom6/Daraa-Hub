import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DataCleanupJob } from './data-cleanup.job';
import { DatabaseMaintenanceJob } from './database-maintenance.job';
import {
  Notification,
  NotificationSchema,
} from '../../database/schemas/notification.schema';
import {
  AuditLog,
  AuditLogSchema,
} from '../../database/schemas/audit-log.schema';
import { Cart, CartSchema } from '../../database/schemas/cart.schema';

/**
 * Jobs Module
 * Provides scheduled jobs for data cleanup and database maintenance
 */
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: AuditLog.name, schema: AuditLogSchema },
      { name: Cart.name, schema: CartSchema },
    ]),
  ],
  providers: [DataCleanupJob, DatabaseMaintenanceJob],
  exports: [DataCleanupJob, DatabaseMaintenanceJob],
})
export class JobsModule {}
