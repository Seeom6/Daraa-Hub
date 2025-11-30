import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationRepository } from '../repositories/notification.repository';
import { NotificationTemplateService } from './notification-template.service';
import { generateObjectId } from '../../testing';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotificationRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByRecipientId: jest.fn(),
    findWithPagination: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  const mockTemplateService = {
    findByCode: jest.fn(),
    processTemplateArabic: jest.fn(),
    createTemplate: jest.fn(),
    getAllTemplates: jest.fn(),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  const notificationId = generateObjectId();
  const recipientId = generateObjectId();

  const mockNotification = {
    _id: notificationId,
    recipientId,
    title: 'Test Notification',
    message: 'Test message',
    type: 'info',
    channels: ['in_app'],
    isRead: false,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: NotificationRepository,
          useValue: mockNotificationRepository,
        },
        { provide: NotificationTemplateService, useValue: mockTemplateService },
        { provide: getQueueToken('notifications'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return notification', async () => {
      mockNotificationRepository.findById.mockResolvedValue(mockNotification);

      const result = await service.findById(notificationId);

      expect(result).toEqual(mockNotification);
    });

    it('should throw if not found', async () => {
      mockNotificationRepository.findById.mockResolvedValue(null);

      await expect(service.findById(notificationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockNotificationRepository.markAsRead.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await service.markAsRead(notificationId);

      expect(result.isRead).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationRepository.markAllAsRead.mockResolvedValue(5);

      const result = await service.markAllAsRead(recipientId);

      expect(result).toBe(5);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockNotificationRepository.getUnreadCount.mockResolvedValue(10);

      const result = await service.getUnreadCount(recipientId);

      expect(result).toBe(10);
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      mockNotificationRepository.delete.mockResolvedValue(true);

      await service.delete(notificationId);

      expect(mockNotificationRepository.delete).toHaveBeenCalledWith(
        notificationId,
      );
    });

    it('should throw if not found', async () => {
      mockNotificationRepository.delete.mockResolvedValue(null);

      await expect(service.delete(notificationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllTemplates', () => {
    it('should delegate to template service', async () => {
      mockTemplateService.getAllTemplates.mockResolvedValue([
        { code: 'WELCOME' },
      ]);

      const result = await service.getAllTemplates();

      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create notification and queue it', async () => {
      const createDto = {
        recipientId,
        recipientRole: 'customer' as const,
        title: 'Test',
        message: 'Test message',
        type: 'info' as const,
        channels: ['in_app', 'push'] as any[],
      };

      const savedNotification = {
        ...mockNotification,
        channels: ['in_app', 'push'],
        save: jest.fn().mockResolvedValue({
          ...mockNotification,
          channels: ['in_app', 'push'],
        }),
      };

      mockNotificationRepository.create.mockResolvedValue(savedNotification);

      const result = await service.create(createDto);

      expect(mockNotificationRepository.create).toHaveBeenCalled();
      expect(mockQueue.add).toHaveBeenCalledTimes(2); // Once for each channel
    });
  });

  describe('sendFromTemplate', () => {
    it('should send notification from template', async () => {
      const template = {
        code: 'WELCOME',
        type: 'info',
        priority: 'normal',
        defaultChannels: ['in_app'],
      };

      mockTemplateService.findByCode.mockResolvedValue(template);
      mockTemplateService.processTemplateArabic.mockReturnValue({
        title: 'Welcome',
        message: 'Welcome to our app',
      });

      const savedNotification = {
        ...mockNotification,
        save: jest.fn().mockResolvedValue(mockNotification),
      };
      mockNotificationRepository.create.mockResolvedValue(savedNotification);

      const result = await service.sendFromTemplate({
        templateCode: 'WELCOME',
        recipientId,
        variables: { name: 'John' },
      });

      expect(mockTemplateService.findByCode).toHaveBeenCalledWith('WELCOME');
      expect(mockTemplateService.processTemplateArabic).toHaveBeenCalled();
    });
  });

  describe('sendBulk', () => {
    it('should send notifications to multiple recipients', async () => {
      const recipientIds = [generateObjectId(), generateObjectId()];
      const template = {
        code: 'ANNOUNCEMENT',
        type: 'info',
        priority: 'normal',
        defaultChannels: ['in_app'],
      };

      mockTemplateService.findByCode.mockResolvedValue(template);
      mockTemplateService.processTemplateArabic.mockReturnValue({
        title: 'Announcement',
        message: 'New announcement',
      });

      const savedNotification = {
        ...mockNotification,
        save: jest.fn().mockResolvedValue(mockNotification),
      };
      mockNotificationRepository.create.mockResolvedValue(savedNotification);

      const result = await service.sendBulk({
        templateCode: 'ANNOUNCEMENT',
        recipientIds,
        variables: {},
      });

      expect(result).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should find all notifications with pagination', async () => {
      mockNotificationRepository.findWithPagination.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.notifications).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should find notifications by recipient', async () => {
      mockNotificationRepository.findByRecipientId.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      const result = await service.findAll({ recipientId, page: 1, limit: 10 });

      expect(result.notifications).toHaveLength(1);
    });

    it('should filter by type and isRead', async () => {
      mockNotificationRepository.findWithPagination.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      const result = await service.findAll({ type: 'info', isRead: false });

      expect(mockNotificationRepository.findWithPagination).toHaveBeenCalled();
    });
  });

  describe('deleteAll', () => {
    it('should delete all notifications for recipient', async () => {
      mockNotificationRepository.find.mockResolvedValue([
        mockNotification,
        mockNotification,
      ]);
      mockNotificationRepository.delete.mockResolvedValue(true);

      const result = await service.deleteAll(recipientId);

      expect(result).toBe(2);
    });
  });

  describe('createTemplate', () => {
    it('should delegate to template service', async () => {
      const template = { code: 'NEW_TEMPLATE', title: 'Test' };
      mockTemplateService.createTemplate.mockResolvedValue(template);

      const result = await service.createTemplate(template);

      expect(mockTemplateService.createTemplate).toHaveBeenCalledWith(template);
    });
  });

  describe('findTemplateByCode', () => {
    it('should delegate to template service', async () => {
      const template = { code: 'WELCOME' };
      mockTemplateService.findByCode.mockResolvedValue(template);

      const result = await service.findTemplateByCode('WELCOME');

      expect(mockTemplateService.findByCode).toHaveBeenCalledWith('WELCOME');
    });
  });

  describe('markAsRead not found', () => {
    it('should throw if notification not found', async () => {
      mockNotificationRepository.markAsRead.mockResolvedValue(null);

      await expect(service.markAsRead(notificationId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll with default pagination', () => {
    it('should use default page and limit when not provided', async () => {
      mockNotificationRepository.findWithPagination.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      const result = await service.findAll({});

      expect(
        mockNotificationRepository.findWithPagination,
      ).toHaveBeenCalledWith({}, 1, 20, { sort: { createdAt: -1 } });
    });
  });

  describe('findAll with recipientId and isRead filter', () => {
    it('should pass isRead filter to findByRecipientId', async () => {
      mockNotificationRepository.findByRecipientId.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      await service.findAll({ recipientId, isRead: true });

      expect(mockNotificationRepository.findByRecipientId).toHaveBeenCalledWith(
        recipientId,
        { page: 1, limit: 20, isRead: true },
      );
    });
  });

  describe('create with relatedId', () => {
    it('should create notification with relatedId', async () => {
      const relatedId = generateObjectId();
      const createDto = {
        recipientId,
        recipientRole: 'customer' as const,
        title: 'Test',
        message: 'Test message',
        type: 'info' as const,
        relatedId,
        relatedModel: 'Order',
      };

      const savedNotification = {
        ...mockNotification,
        relatedId,
        save: jest.fn().mockResolvedValue({
          ...mockNotification,
          relatedId,
        }),
      };

      mockNotificationRepository.create.mockResolvedValue(savedNotification);

      await service.create(createDto);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          relatedId: expect.any(Object),
        }),
      );
    });
  });

  describe('create without channels', () => {
    it('should use default in_app channel when not provided', async () => {
      const createDto = {
        recipientId,
        recipientRole: 'customer' as const,
        title: 'Test',
        message: 'Test message',
        type: 'info' as const,
      };

      const savedNotification = {
        ...mockNotification,
        save: jest.fn().mockResolvedValue(mockNotification),
      };

      mockNotificationRepository.create.mockResolvedValue(savedNotification);

      await service.create(createDto);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: ['in_app'],
        }),
      );
    });
  });

  describe('sendFromTemplate with custom channels', () => {
    it('should use custom channels when provided', async () => {
      const template = {
        code: 'WELCOME',
        type: 'info',
        priority: 'normal',
        defaultChannels: ['in_app'],
      };

      mockTemplateService.findByCode.mockResolvedValue(template);
      mockTemplateService.processTemplateArabic.mockReturnValue({
        title: 'Welcome',
        message: 'Welcome to our app',
      });

      const savedNotification = {
        ...mockNotification,
        channels: ['push', 'sms'],
        save: jest.fn().mockResolvedValue({
          ...mockNotification,
          channels: ['push', 'sms'],
        }),
      };
      mockNotificationRepository.create.mockResolvedValue(savedNotification);

      await service.sendFromTemplate({
        templateCode: 'WELCOME',
        recipientId,
        variables: { name: 'John' },
        channels: ['push', 'sms'],
      });

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          channels: ['push', 'sms'],
        }),
      );
    });
  });
});
