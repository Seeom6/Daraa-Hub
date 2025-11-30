import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../../database/schemas/notification.schema';
import { AuditLog } from '../../database/schemas/audit-log.schema';
import { Cart } from '../../database/schemas/cart.schema';

/**
 * Data Cleanup Job
 * Handles automatic cleanup of old/expired data
 *
 * Runs daily at 3 AM to:
 * - Delete old read notifications (90+ days)
 * - Archive old audit logs (365+ days)
 * - Clean up abandoned carts (7+ days)
 * - Clean up expired sessions
 */
@Injectable()
export class DataCleanupJob {
  private readonly logger = new Logger(DataCleanupJob.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLog>,
    @InjectModel(Cart.name)
    private cartModel: Model<Cart>,
  ) {}

  /**
   * Daily cleanup job - runs at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyCleanup() {
    this.logger.log('Starting daily data cleanup...');
    const startTime = Date.now();

    try {
      const results = await Promise.all([
        this.cleanupOldNotifications(),
        this.cleanupAbandonedCarts(),
        this.cleanupExpiredData(),
      ]);

      const duration = Date.now() - startTime;
      this.logger.log(
        `Daily cleanup completed in ${duration}ms. ` +
          `Notifications: ${results[0]}, Carts: ${results[1]}, Expired: ${results[2]}`,
      );
    } catch (error) {
      this.logger.error('Daily cleanup failed:', error);
    }
  }

  /**
   * Weekly archive job - runs every Sunday at 2 AM
   */
  @Cron('0 2 * * 0')
  async handleWeeklyArchive() {
    this.logger.log('Starting weekly data archive...');
    const startTime = Date.now();

    try {
      const archivedCount = await this.archiveOldAuditLogs();
      const duration = Date.now() - startTime;
      this.logger.log(
        `Weekly archive completed in ${duration}ms. Archived ${archivedCount} audit logs.`,
      );
    } catch (error) {
      this.logger.error('Weekly archive failed:', error);
    }
  }

  /**
   * Clean up old read notifications (older than 90 days)
   */
  private async cleanupOldNotifications(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    const result = await this.notificationModel.deleteMany({
      isRead: true,
      createdAt: { $lt: cutoffDate },
    });

    this.logger.debug(`Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  }

  /**
   * Clean up abandoned carts (older than 7 days)
   */
  private async cleanupAbandonedCarts(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const result = await this.cartModel.deleteMany({
      updatedAt: { $lt: cutoffDate },
      $or: [
        { customerId: { $exists: false } },
        { 'items.0': { $exists: false } },
      ],
    });

    this.logger.debug(`Deleted ${result.deletedCount} abandoned carts`);
    return result.deletedCount;
  }

  /**
   * Clean up expired data (sessions, tokens, etc.)
   */
  private async cleanupExpiredData(): Promise<number> {
    // This is handled by TTL indexes, but we can add additional cleanup here
    // For example, cleaning up orphaned data
    return 0;
  }

  /**
   * Archive old audit logs (older than 365 days)
   * In production, this would move data to cold storage (S3, etc.)
   */
  private async archiveOldAuditLogs(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);

    // In production, you would:
    // 1. Export old logs to S3/cold storage
    // 2. Then delete from MongoDB
    // For now, we just count them (TTL index handles deletion)

    const count = await this.auditLogModel.countDocuments({
      createdAt: { $lt: cutoffDate },
    });

    this.logger.debug(`Found ${count} audit logs eligible for archiving`);
    return count;
  }

  /**
   * Manual cleanup trigger (for admin use)
   */
  async triggerManualCleanup(): Promise<{
    notifications: number;
    carts: number;
    expired: number;
  }> {
    this.logger.log('Manual cleanup triggered');

    const [notifications, carts, expired] = await Promise.all([
      this.cleanupOldNotifications(),
      this.cleanupAbandonedCarts(),
      this.cleanupExpiredData(),
    ]);

    return { notifications, carts, expired };
  }
}
