import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { Notification, NotificationDocument } from '../../../../database/schemas/notification.schema';
import { NotificationTemplate, NotificationTemplateDocument } from '../../../../database/schemas/notification-template.schema';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { SendNotificationDto, SendBulkNotificationDto } from '../dto/send-notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationTemplate.name)
    private notificationTemplateModel: Model<NotificationTemplateDocument>,
    @InjectQueue('notifications')
    private notificationQueue: Queue,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      recipientId: new Types.ObjectId(createNotificationDto.recipientId),
      relatedId: createNotificationDto.relatedId ? new Types.ObjectId(createNotificationDto.relatedId) : undefined,
      channels: createNotificationDto.channels || ['in_app'],
    });

    const saved = await notification.save();

    // Queue notification for delivery
    await this.queueNotification(saved);

    return saved;
  }

  async sendFromTemplate(sendNotificationDto: SendNotificationDto): Promise<NotificationDocument> {
    const template = await this.notificationTemplateModel
      .findOne({ code: sendNotificationDto.templateCode, isActive: true })
      .exec();

    if (!template) {
      throw new NotFoundException(`Notification template '${sendNotificationDto.templateCode}' not found`);
    }

    // Replace variables in template
    const title = this.replaceVariables(template.inApp?.titleAr || '', sendNotificationDto.variables);
    const message = this.replaceVariables(template.inApp?.messageAr || '', sendNotificationDto.variables);

    const createDto: CreateNotificationDto = {
      recipientId: sendNotificationDto.recipientId,
      recipientRole: 'customer', // Will be determined from account
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

  async sendBulk(sendBulkDto: SendBulkNotificationDto): Promise<NotificationDocument[]> {
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

  async findAll(filters?: {
    recipientId?: string;
    type?: string;
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ notifications: NotificationDocument[]; total: number; page: number; totalPages: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters?.recipientId) {
      query.recipientId = new Types.ObjectId(filters.recipientId);
    }

    if (filters?.type) {
      query.type = filters.type;
    }

    if (filters?.isRead !== undefined) {
      query.isRead = filters.isRead;
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.notificationModel.countDocuments(query).exec(),
    ]);

    return {
      notifications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel.findById(id).exec();
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async markAsRead(id: string): Promise<NotificationDocument> {
    const notification = await this.notificationModel
      .findByIdAndUpdate(
        id,
        { isRead: true, readAt: new Date() },
        { new: true },
      )
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany(
        { recipientId: new Types.ObjectId(recipientId), isRead: false },
        { isRead: true, readAt: new Date() },
      )
      .exec();

    return result.modifiedCount;
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.notificationModel
      .countDocuments({
        recipientId: new Types.ObjectId(recipientId),
        isRead: false,
      })
      .exec();
  }

  async delete(id: string): Promise<void> {
    const result = await this.notificationModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }
  }

  async deleteAll(recipientId: string): Promise<number> {
    const result = await this.notificationModel
      .deleteMany({ recipientId: new Types.ObjectId(recipientId) })
      .exec();

    return result.deletedCount;
  }

  // Template management
  async createTemplate(template: Partial<NotificationTemplate>): Promise<NotificationTemplateDocument> {
    const newTemplate = new this.notificationTemplateModel(template);
    return newTemplate.save();
  }

  async findTemplateByCode(code: string): Promise<NotificationTemplateDocument> {
    const template = await this.notificationTemplateModel.findOne({ code }).exec();
    if (!template) {
      throw new NotFoundException(`Template '${code}' not found`);
    }
    return template;
  }

  async getAllTemplates(): Promise<NotificationTemplateDocument[]> {
    return this.notificationTemplateModel.find().exec();
  }

  // Helper methods
  private replaceVariables(text: string, variables?: Record<string, any>): string {
    if (!variables) return text;

    let result = text;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  private async queueNotification(notification: NotificationDocument): Promise<void> {
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

