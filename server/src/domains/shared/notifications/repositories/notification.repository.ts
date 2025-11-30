import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../../../../database/schemas/notification.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class NotificationRepository extends BaseRepository<NotificationDocument> {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
  ) {
    super(notificationModel);
  }

  /**
   * Find notifications by recipient ID
   */
  async findByRecipientId(
    recipientId: string,
    options?: {
      page?: number;
      limit?: number;
      isRead?: boolean;
    },
  ): Promise<{ data: NotificationDocument[]; total: number }> {
    const filter: any = { recipientId: new Types.ObjectId(recipientId) };

    if (options?.isRead !== undefined) {
      filter.isRead = options.isRead;
    }

    return this.findWithPagination(
      filter,
      options?.page || 1,
      options?.limit || 20,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
  ): Promise<NotificationDocument | null> {
    return this.findByIdAndUpdate(notificationId, {
      isRead: true,
      readAt: new Date(),
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await this.notificationModel.updateMany(
      { recipientId: new Types.ObjectId(recipientId), isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return result.modifiedCount;
  }

  /**
   * Get unread count
   */
  async getUnreadCount(recipientId: string): Promise<number> {
    return this.count({
      recipientId: new Types.ObjectId(recipientId),
      isRead: false,
    });
  }

  /**
   * Delete old notifications
   */
  async deleteOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.notificationModel.deleteMany({
      createdAt: { $lt: cutoffDate },
      isRead: true,
    });

    return result.deletedCount;
  }
}
