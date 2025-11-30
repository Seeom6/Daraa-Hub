import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { NotificationDocument } from '../../../../database/schemas/notification.schema';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import {
  SendNotificationDto,
  SendBulkNotificationDto,
} from '../dto/send-notification.dto';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationTemplateService } from './notification-template.service';

/**
 * Notifications Service
 * Handles notification CRUD and delivery
 * Delegates template operations to NotificationTemplateService
 */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly templateService: NotificationTemplateService,
    @InjectQueue('notifications')
    private notificationQueue: Queue,
  ) {}

  // ============================================
  // Notification CRUD Operations
  // ============================================

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationDocument> {
    const notificationData = {
      ...createNotificationDto,
      recipientId: new Types.ObjectId(createNotificationDto.recipientId),
      relatedId: createNotificationDto.relatedId
        ? new Types.ObjectId(createNotificationDto.relatedId)
        : undefined,
      channels: createNotificationDto.channels || ['in_app'],
    };

    const notification = await this.notificationRepository.create(
      notificationData as any,
    );
    const saved = await notification.save();

    // Queue notification for delivery
    await this.queueNotification(saved);

    return saved;
  }

  // ============================================
  // Template-based Notifications
  // ============================================

  async sendFromTemplate(
    sendNotificationDto: SendNotificationDto,
  ): Promise<NotificationDocument> {
    // Get template via TemplateService
    const template = await this.templateService.findByCode(
      sendNotificationDto.templateCode,
    );

    // Process template with variables
    const { title, message } = this.templateService.processTemplateArabic(
      template,
      sendNotificationDto.variables,
    );

    const createDto: CreateNotificationDto = {
      recipientId: sendNotificationDto.recipientId,
      recipientRole: 'customer',
      title,
      message,
      type: template.type,
      priority: template.priority,
      channels: sendNotificationDto.channels || template.defaultChannels,
      relatedId: sendNotificationDto.relatedId,
      relatedModel: sendNotificationDto.relatedModel,
      data: sendNotificationDto.variables,
    };

    return this.create(createDto);
  }

  async sendBulk(
    sendBulkDto: SendBulkNotificationDto,
  ): Promise<NotificationDocument[]> {
    const notifications: NotificationDocument[] = [];

    for (const recipientId of sendBulkDto.recipientIds) {
      const notification = await this.sendFromTemplate({
        templateCode: sendBulkDto.templateCode,
        recipientId,
        variables: sendBulkDto.variables,
        channels: sendBulkDto.channels,
      });
      notifications.push(notification);
    }

    return notifications;
  }

  // ============================================
  // Query Operations (using Repository)
  // ============================================

  async findAll(filters?: {
    recipientId?: string;
    type?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    notifications: NotificationDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;

    if (filters?.recipientId) {
      const result = await this.notificationRepository.findByRecipientId(
        filters.recipientId,
        { page, limit, isRead: filters.isRead },
      );
      return {
        notifications: result.data,
        total: result.total,
        page,
        totalPages: Math.ceil(result.total / limit),
      };
    }

    // General query with filters
    const query: any = {};
    if (filters?.type) query.type = filters.type;
    if (filters?.isRead !== undefined) query.isRead = filters.isRead;

    const result = await this.notificationRepository.findWithPagination(
      query,
      page,
      limit,
      { sort: { createdAt: -1 } },
    );

    return {
      notifications: result.data,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async findById(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async markAsRead(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationRepository.markAsRead(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    return this.notificationRepository.markAllAsRead(recipientId);
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.notificationRepository.getUnreadCount(recipientId);
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.notificationRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Notification not found');
    }
  }

  async deleteAll(recipientId: string): Promise<number> {
    const notifications = await this.notificationRepository.find({
      recipientId: new Types.ObjectId(recipientId),
    });

    let count = 0;
    for (const notification of notifications) {
      await this.notificationRepository.delete(
        (notification._id as Types.ObjectId).toString(),
      );
      count++;
    }
    return count;
  }

  // ============================================
  // Template Management (delegated to TemplateService)
  // ============================================

  async createTemplate(template: any): Promise<any> {
    return this.templateService.createTemplate(template);
  }

  async findTemplateByCode(code: string): Promise<any> {
    return this.templateService.findByCode(code);
  }

  async getAllTemplates(): Promise<any[]> {
    return this.templateService.getAllTemplates();
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async queueNotification(
    notification: NotificationDocument,
  ): Promise<void> {
    for (const channel of notification.channels) {
      await this.notificationQueue.add(
        `send-${channel}`,
        {
          notificationId: (notification._id as Types.ObjectId).toString(),
          channel,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      );
    }
  }
}
