import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { NotificationProcessor } from './notification.processor';
import { Notification } from '../../../../database/schemas/notification.schema';
import { EmailService } from '../../../../infrastructure/email/email.service';
import { RecipientContactResolverService } from '../services/recipient-contact-resolver.service';

describe('NotificationProcessor', () => {
  let processor: NotificationProcessor;
  let mockNotificationModel: any;
  let mockEmailService: any;
  let mockSmsService: any;
  let mockRecipientResolver: any;

  const mockNotificationId = new Types.ObjectId().toString();
  const mockNotification = {
    _id: new Types.ObjectId(mockNotificationId),
    recipientId: new Types.ObjectId(),
    recipientRole: 'customer',
    title: 'Test Notification',
    message: 'Test message content',
    channels: ['email', 'sms', 'push', 'in_app'],
    actionUrl: 'https://daraa.com/orders/123',
  };

  beforeEach(async () => {
    mockNotificationModel = {
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockNotification),
      }),
      findByIdAndUpdate: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };

    mockEmailService = {
      sendEmail: jest.fn().mockResolvedValue(true),
    };

    mockSmsService = {
      sendMessage: jest.fn().mockResolvedValue(true),
    };

    mockRecipientResolver = {
      getEmail: jest.fn().mockResolvedValue('test@example.com'),
      getPhoneNumber: jest.fn().mockResolvedValue('+963991234567'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationProcessor,
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
        { provide: EmailService, useValue: mockEmailService },
        { provide: 'SMS_SERVICE', useValue: mockSmsService },
        {
          provide: RecipientContactResolverService,
          useValue: mockRecipientResolver,
        },
      ],
    }).compile();

    processor = module.get<NotificationProcessor>(NotificationProcessor);
  });

  describe('handlePushNotification', () => {
    it('should process push notification', async () => {
      const job = { data: { notificationId: mockNotificationId } } as any;

      await processor.handlePushNotification(job);

      expect(mockNotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockNotificationId,
        expect.objectContaining({ 'deliveryStatus.push': 'sent' }),
      );
    });

    it('should handle notification not found', async () => {
      mockNotificationModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const job = { data: { notificationId: 'non-existent' } } as any;

      await processor.handlePushNotification(job);

      expect(mockNotificationModel.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe('handleEmailNotification', () => {
    it('should send email notification', async () => {
      const job = { data: { notificationId: mockNotificationId } } as any;

      await processor.handleEmailNotification(job);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'test@example.com',
          subject: 'Test Notification',
        }),
      );
    });

    it('should handle missing email', async () => {
      mockRecipientResolver.getEmail.mockResolvedValue(null);
      const job = { data: { notificationId: mockNotificationId } } as any;

      await processor.handleEmailNotification(job);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });
  });

  describe('handleSmsNotification', () => {
    it('should send SMS notification', async () => {
      const job = { data: { notificationId: mockNotificationId } } as any;

      await processor.handleSmsNotification(job);

      expect(mockSmsService.sendMessage).toHaveBeenCalledWith(
        '+963991234567',
        expect.stringContaining('Test Notification'),
      );
    });

    it('should handle missing phone number', async () => {
      mockRecipientResolver.getPhoneNumber.mockResolvedValue(null);
      const job = { data: { notificationId: mockNotificationId } } as any;

      await processor.handleSmsNotification(job);

      expect(mockSmsService.sendMessage).not.toHaveBeenCalled();
    });
  });

  describe('handleInAppNotification', () => {
    it('should process in-app notification', async () => {
      const job = { data: { notificationId: mockNotificationId } } as any;

      await processor.handleInAppNotification(job);

      expect(mockNotificationModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockNotificationId,
        expect.objectContaining({ 'deliveryStatus.in_app': 'sent' }),
      );
    });

    it('should handle error and mark as failed', async () => {
      mockNotificationModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      });
      const job = { data: { notificationId: mockNotificationId } } as any;

      await expect(processor.handleInAppNotification(job)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('handlePushNotification error handling', () => {
    it('should handle error and mark as failed', async () => {
      mockNotificationModel.findByIdAndUpdate
        .mockReturnValueOnce({
          exec: jest.fn().mockResolvedValue({}),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockRejectedValue(new Error('Push error')),
        });

      // First call succeeds (for sent), but we need to simulate error
      mockNotificationModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      const job = { data: { notificationId: mockNotificationId } } as any;

      await expect(processor.handlePushNotification(job)).rejects.toThrow(
        'DB error',
      );
    });
  });

  describe('handleEmailNotification error handling', () => {
    it('should handle notification not found', async () => {
      mockNotificationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const job = { data: { notificationId: mockNotificationId } } as any;

      await processor.handleEmailNotification(job);

      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should handle email send error', async () => {
      mockEmailService.sendEmail.mockRejectedValue(new Error('Email error'));
      const job = { data: { notificationId: mockNotificationId } } as any;

      await expect(processor.handleEmailNotification(job)).rejects.toThrow(
        'Email error',
      );
    });
  });

  describe('handleSmsNotification error handling', () => {
    it('should handle notification not found', async () => {
      mockNotificationModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const job = { data: { notificationId: mockNotificationId } } as any;

      await processor.handleSmsNotification(job);

      expect(mockSmsService.sendMessage).not.toHaveBeenCalled();
    });

    it('should handle SMS send error', async () => {
      mockSmsService.sendMessage.mockRejectedValue(new Error('SMS error'));
      const job = { data: { notificationId: mockNotificationId } } as any;

      await expect(processor.handleSmsNotification(job)).rejects.toThrow(
        'SMS error',
      );
    });
  });
});
