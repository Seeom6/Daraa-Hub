import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from '../../../../database/schemas/notification.schema';
import { EmailService } from '../../../../infrastructure/email/email.service';
import type { ISmsService } from '../../../../infrastructure/sms/sms.interface';
import { RecipientContactResolverService } from '../services/recipient-contact-resolver.service';

@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    private emailService: EmailService,
    @Inject('SMS_SERVICE')
    private smsService: ISmsService,
    private recipientContactResolver: RecipientContactResolverService,
  ) {}

  @Process('send-push')
  async handlePushNotification(job: Job) {
    const { notificationId } = job.data;
    this.logger.log(`Processing push notification: ${notificationId}`);

    try {
      const notification = await this.notificationModel
        .findById(notificationId)
        .populate('recipientId')
        .exec();

      if (!notification) {
        this.logger.error(`Notification not found: ${notificationId}`);
        return;
      }

      // TODO: Implement push notification service (Firebase, OneSignal, etc.)
      // For now, just mark as sent
      await this.updateDeliveryStatus(notificationId, 'push', 'sent');
      
      this.logger.log(`Push notification sent: ${notificationId}`);
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${notificationId}`, error);
      await this.updateDeliveryStatus(notificationId, 'push', 'failed');
      throw error;
    }
  }

  @Process('send-email')
  async handleEmailNotification(job: Job) {
    const { notificationId } = job.data;
    this.logger.log(`Processing email notification: ${notificationId}`);

    try {
      const notification = await this.notificationModel
        .findById(notificationId)
        .exec();

      if (!notification) {
        this.logger.error(`Notification not found: ${notificationId}`);
        return;
      }

      // استخدام RecipientContactResolver للحصول على البريد الإلكتروني
      // Use RecipientContactResolver to get email
      const email = await this.recipientContactResolver.getEmail(
        notification.recipientId,
        notification.recipientRole,
      );

      if (!email) {
        this.logger.warn(
          `Recipient has no email: ${notification.recipientId} (${notification.recipientRole})`,
        );
        await this.updateDeliveryStatus(notificationId, 'email', 'failed');
        return;
      }

      // Send email
      await this.emailService.sendEmail({
        to: email,
        subject: notification.title,
        html: `
          <div dir="rtl" style="font-family: Arial, sans-serif;">
            <h2>${notification.title}</h2>
            <p>${notification.message}</p>
            ${notification.actionUrl ? `<a href="${notification.actionUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px;">عرض التفاصيل</a>` : ''}
          </div>
        `,
      });

      await this.updateDeliveryStatus(notificationId, 'email', 'sent');
      this.logger.log(`Email notification sent: ${notificationId}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification: ${notificationId}`, error);
      await this.updateDeliveryStatus(notificationId, 'email', 'failed');
      throw error;
    }
  }

  @Process('send-sms')
  async handleSmsNotification(job: Job) {
    const { notificationId } = job.data;
    this.logger.log(`Processing SMS notification: ${notificationId}`);

    try {
      const notification = await this.notificationModel
        .findById(notificationId)
        .exec();

      if (!notification) {
        this.logger.error(`Notification not found: ${notificationId}`);
        return;
      }

      // استخدام RecipientContactResolver للحصول على رقم الهاتف
      // Use RecipientContactResolver to get phone number
      // هذا يجعل النظام مستقل عن مكتبة الإرسال (Twilio, etc.)
      // This makes the system independent of the sending library (Twilio, etc.)
      const phoneNumber = await this.recipientContactResolver.getPhoneNumber(
        notification.recipientId,
        notification.recipientRole,
      );

      if (!phoneNumber) {
        this.logger.warn(
          `Recipient has no phone number: ${notification.recipientId} (${notification.recipientRole})`,
        );
        await this.updateDeliveryStatus(notificationId, 'sms', 'failed');
        return;
      }

      // إرسال SMS - يمكن تغيير مكتبة الإرسال بسهولة في المستقبل
      // Send SMS - sending library can be easily changed in the future
      await this.smsService.sendMessage(
        phoneNumber,
        `${notification.title}\n${notification.message}`,
      );

      await this.updateDeliveryStatus(notificationId, 'sms', 'sent');
      this.logger.log(`SMS notification sent: ${notificationId}`);
    } catch (error) {
      this.logger.error(`Failed to send SMS notification: ${notificationId}`, error);
      await this.updateDeliveryStatus(notificationId, 'sms', 'failed');
      throw error;
    }
  }

  @Process('send-in_app')
  async handleInAppNotification(job: Job) {
    const { notificationId } = job.data;
    this.logger.log(`Processing in-app notification: ${notificationId}`);

    try {
      // In-app notifications are already stored in database
      // Just mark as sent
      await this.updateDeliveryStatus(notificationId, 'in_app', 'sent');
      
      // TODO: Emit WebSocket event to notify connected clients
      
      this.logger.log(`In-app notification sent: ${notificationId}`);
    } catch (error) {
      this.logger.error(`Failed to send in-app notification: ${notificationId}`, error);
      await this.updateDeliveryStatus(notificationId, 'in_app', 'failed');
      throw error;
    }
  }

  private async updateDeliveryStatus(
    notificationId: string,
    channel: 'push' | 'email' | 'sms' | 'in_app',
    status: 'sent' | 'failed',
  ): Promise<void> {
    await this.notificationModel
      .findByIdAndUpdate(notificationId, {
        [`deliveryStatus.${channel}`]: status,
        sentAt: status === 'sent' ? new Date() : undefined,
      })
      .exec();
  }
}

