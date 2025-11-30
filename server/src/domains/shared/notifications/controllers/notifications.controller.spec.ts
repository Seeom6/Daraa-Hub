import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from '../services/notifications.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { DeviceTokenService } from '../services/device-token.service';
import { generateObjectId } from '../../testing';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { PermissionsGuard } from '../../admin/guards/permissions.guard';

describe('NotificationsController', () => {
  let controller: NotificationsController;
  let notificationsService: jest.Mocked<NotificationsService>;
  let preferenceService: jest.Mocked<NotificationPreferenceService>;
  let deviceTokenService: jest.Mocked<DeviceTokenService>;

  const mockNotificationsService = {
    findAll: jest.fn(),
    getUnreadCount: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    delete: jest.fn(),
    deleteAll: jest.fn(),
    create: jest.fn(),
    sendFromTemplate: jest.fn(),
    sendBulk: jest.fn(),
    getAllTemplates: jest.fn(),
    findTemplateByCode: jest.fn(),
  };

  const mockPreferenceService = {
    getPreferences: jest.fn(),
    updatePreferences: jest.fn(),
  };

  const mockDeviceTokenService = {
    registerToken: jest.fn(),
    getUserTokens: jest.fn(),
    deleteToken: jest.fn(),
  };

  const accountId = generateObjectId();
  const mockRequest = { user: { sub: accountId } };

  const mockNotification = {
    _id: generateObjectId(),
    recipientId: accountId,
    title: 'Test Notification',
    message: 'Test message',
    isRead: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
        {
          provide: NotificationPreferenceService,
          useValue: mockPreferenceService,
        },
        { provide: DeviceTokenService, useValue: mockDeviceTokenService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    notificationsService = module.get(NotificationsService);
    preferenceService = module.get(NotificationPreferenceService);
    deviceTokenService = module.get(DeviceTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyNotifications', () => {
    it('should return user notifications', async () => {
      mockNotificationsService.findAll.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      const result = await controller.getMyNotifications(mockRequest);

      expect(result.success).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      mockNotificationsService.getUnreadCount.mockResolvedValue(5);

      const result = await controller.getUnreadCount(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      mockNotificationsService.markAsRead.mockResolvedValue({
        ...mockNotification,
        isRead: true,
      });

      const result = await controller.markAsRead(
        mockNotification._id,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification marked as read');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      mockNotificationsService.markAllAsRead.mockResolvedValue(10);

      const result = await controller.markAllAsRead(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(10);
    });
  });

  describe('deleteNotification', () => {
    it('should delete notification', async () => {
      mockNotificationsService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteNotification(mockNotification._id);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification deleted successfully');
    });
  });

  describe('deleteAllNotifications', () => {
    it('should delete all notifications', async () => {
      mockNotificationsService.deleteAll.mockResolvedValue(5);

      const result = await controller.deleteAllNotifications(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(5);
    });
  });

  describe('createNotification', () => {
    it('should create notification', async () => {
      const createDto = {
        recipientId: accountId,
        title: 'Test',
        message: 'Test',
      };
      mockNotificationsService.create.mockResolvedValue(mockNotification);

      const result = await controller.createNotification(createDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification created successfully');
    });
  });

  describe('sendNotification', () => {
    it('should send notification from template', async () => {
      const sendDto = { templateCode: 'WELCOME', recipientId: accountId };
      mockNotificationsService.sendFromTemplate.mockResolvedValue(
        mockNotification,
      );

      const result = await controller.sendNotification(sendDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification sent successfully');
    });
  });

  describe('sendBulkNotification', () => {
    it('should send bulk notifications', async () => {
      const sendBulkDto = {
        templateCode: 'WELCOME',
        recipientIds: [accountId],
      };
      mockNotificationsService.sendBulk.mockResolvedValue([mockNotification]);

      const result = await controller.sendBulkNotification(sendBulkDto as any);

      expect(result.success).toBe(true);
      expect(result.data.count).toBe(1);
    });
  });

  describe('getPreferences', () => {
    it('should return preferences', async () => {
      const preferences = { email: true, push: true };
      mockPreferenceService.getPreferences.mockResolvedValue(preferences);

      const result = await controller.getPreferences(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(preferences);
    });
  });

  describe('registerDevice', () => {
    it('should register device', async () => {
      const registerDto = { token: 'device-token', platform: 'ios' };
      const deviceToken = { _id: generateObjectId(), ...registerDto };
      mockDeviceTokenService.registerToken.mockResolvedValue(deviceToken);

      const result = await controller.registerDevice(
        mockRequest,
        registerDto as any,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Device registered successfully');
    });
  });

  describe('getMyNotifications with filters', () => {
    it('should filter by type', async () => {
      mockNotificationsService.findAll.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      await controller.getMyNotifications(mockRequest, 'info');

      expect(mockNotificationsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'info',
        }),
      );
    });

    it('should filter by isRead true', async () => {
      mockNotificationsService.findAll.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      await controller.getMyNotifications(mockRequest, undefined, 'true');

      expect(mockNotificationsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          isRead: true,
        }),
      );
    });

    it('should filter by isRead false', async () => {
      mockNotificationsService.findAll.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      await controller.getMyNotifications(mockRequest, undefined, 'false');

      expect(mockNotificationsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          isRead: false,
        }),
      );
    });

    it('should use custom page and limit', async () => {
      mockNotificationsService.findAll.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      await controller.getMyNotifications(
        mockRequest,
        undefined,
        undefined,
        '2',
        '50',
      );

      expect(mockNotificationsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 50,
        }),
      );
    });

    it('should use default page and limit when not provided', async () => {
      mockNotificationsService.findAll.mockResolvedValue({
        data: [mockNotification],
        total: 1,
      });

      await controller.getMyNotifications(mockRequest);

      expect(mockNotificationsService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 20,
        }),
      );
    });
  });

  describe('getAllTemplates', () => {
    it('should return all templates', async () => {
      const templates = [{ code: 'WELCOME' }, { code: 'ORDER_CONFIRMED' }];
      mockNotificationsService.getAllTemplates.mockResolvedValue(templates);

      const result = await controller.getAllTemplates();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(templates);
    });
  });

  describe('getTemplateByCode', () => {
    it('should return template by code', async () => {
      const template = { code: 'WELCOME', title: 'Welcome' };
      mockNotificationsService.findTemplateByCode.mockResolvedValue(template);

      const result = await controller.getTemplateByCode('WELCOME');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(template);
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences', async () => {
      const updateDto = { email: false, push: true };
      const updatedPreferences = { email: false, push: true };
      mockPreferenceService.updatePreferences.mockResolvedValue(
        updatedPreferences,
      );

      const result = await controller.updatePreferences(
        mockRequest,
        updateDto as any,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Notification preferences updated successfully',
      );
      expect(result.data).toEqual(updatedPreferences);
    });
  });

  describe('getMyDevices', () => {
    it('should return user devices', async () => {
      const devices = [
        { token: 'device-token-1' },
        { token: 'device-token-2' },
      ];
      mockDeviceTokenService.getUserTokens.mockResolvedValue(devices);

      const result = await controller.getMyDevices(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(devices);
    });
  });

  describe('deleteDevice', () => {
    it('should delete device', async () => {
      const deviceId = generateObjectId();
      mockDeviceTokenService.deleteToken.mockResolvedValue(undefined);

      const result = await controller.deleteDevice(mockRequest, deviceId);

      expect(mockDeviceTokenService.deleteToken).toHaveBeenCalledWith(
        deviceId,
        accountId,
      );
      expect(result.success).toBe(true);
      expect(result.message).toBe('Device removed successfully');
    });
  });
});
