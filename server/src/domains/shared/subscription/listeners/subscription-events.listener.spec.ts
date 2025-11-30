import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SubscriptionEventsListener } from './subscription-events.listener';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { Types } from 'mongoose';

describe('SubscriptionEventsListener', () => {
  let listener: SubscriptionEventsListener;
  let notificationsService: jest.Mocked<NotificationsService>;
  let storeProfileModel: any;

  const mockStoreProfileModel = {
    findById: jest.fn(),
  };

  const mockNotificationsService = {
    sendFromTemplate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionEventsListener,
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreProfileModel,
        },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    listener = module.get<SubscriptionEventsListener>(
      SubscriptionEventsListener,
    );
    notificationsService = module.get(NotificationsService);
    storeProfileModel = module.get(getModelToken(StoreOwnerProfile.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockStore = () => ({
    _id: new Types.ObjectId(),
    storeName: 'Test Store',
    dailyProductLimit: 100,
    accountId: { _id: new Types.ObjectId() },
  });

  describe('handleSubscriptionActivated', () => {
    it('should send notification when subscription is activated', async () => {
      const mockStore = createMockStore();
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockStore),
        }),
      });
      mockNotificationsService.sendFromTemplate.mockResolvedValue(undefined);

      await listener.handleSubscriptionActivated({
        storeId: mockStore._id.toString(),
        planName: 'Premium',
        endDate: new Date('2025-12-31'),
      });

      expect(notificationsService.sendFromTemplate).toHaveBeenCalledWith({
        templateCode: 'SUBSCRIPTION_ACTIVATED',
        recipientId: mockStore.accountId._id.toString(),
        channels: ['in_app', 'email'],
        variables: expect.objectContaining({
          storeName: 'Test Store',
          planName: 'Premium',
        }),
      });
    });

    it('should not send notification when store is not found', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await listener.handleSubscriptionActivated({
        storeId: new Types.ObjectId().toString(),
        planName: 'Premium',
        endDate: new Date(),
      });

      expect(notificationsService.sendFromTemplate).not.toHaveBeenCalled();
    });

    it('should handle error gracefully', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });

      await expect(
        listener.handleSubscriptionActivated({
          storeId: new Types.ObjectId().toString(),
          planName: 'Premium',
          endDate: new Date(),
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('handleSubscriptionExpired', () => {
    it('should send notification when subscription expires', async () => {
      const mockStore = createMockStore();
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockStore),
        }),
      });

      await listener.handleSubscriptionExpired({
        storeId: mockStore._id.toString(),
        planName: 'Premium',
      });

      expect(notificationsService.sendFromTemplate).toHaveBeenCalledWith({
        templateCode: 'SUBSCRIPTION_EXPIRED',
        recipientId: mockStore.accountId._id.toString(),
        channels: ['in_app', 'email', 'sms'],
        variables: expect.objectContaining({
          storeName: 'Test Store',
          planName: 'Premium',
        }),
      });
    });

    it('should not send notification when store is not found', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await listener.handleSubscriptionExpired({
        storeId: new Types.ObjectId().toString(),
        planName: 'Premium',
      });

      expect(notificationsService.sendFromTemplate).not.toHaveBeenCalled();
    });

    it('should handle error gracefully', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });

      await expect(
        listener.handleSubscriptionExpired({
          storeId: new Types.ObjectId().toString(),
          planName: 'Premium',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('handleSubscriptionExpiryWarning', () => {
    it('should send warning notification', async () => {
      const mockStore = createMockStore();
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockStore),
        }),
      });

      await listener.handleSubscriptionExpiryWarning({
        storeId: mockStore._id.toString(),
        planName: 'Premium',
        daysLeft: 7,
        expiryDate: '2025-12-31',
      });

      expect(notificationsService.sendFromTemplate).toHaveBeenCalledWith({
        templateCode: 'SUBSCRIPTION_EXPIRY_WARNING',
        recipientId: mockStore.accountId._id.toString(),
        channels: ['in_app', 'email', 'sms'],
        variables: expect.objectContaining({
          daysLeft: '7',
          expiryDate: '2025-12-31',
        }),
      });
    });

    it('should not send notification when store is not found', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await listener.handleSubscriptionExpiryWarning({
        storeId: new Types.ObjectId().toString(),
        planName: 'Premium',
        daysLeft: 7,
        expiryDate: '2025-12-31',
      });

      expect(notificationsService.sendFromTemplate).not.toHaveBeenCalled();
    });

    it('should handle error gracefully', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });

      await expect(
        listener.handleSubscriptionExpiryWarning({
          storeId: new Types.ObjectId().toString(),
          planName: 'Premium',
          daysLeft: 7,
          expiryDate: '2025-12-31',
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('handleDailyLimitReached', () => {
    it('should send daily limit notification', async () => {
      const mockStore = createMockStore();
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockStore),
        }),
      });

      await listener.handleDailyLimitReached({
        storeId: mockStore._id.toString(),
        dailyLimit: 100,
      });

      expect(notificationsService.sendFromTemplate).toHaveBeenCalledWith({
        templateCode: 'DAILY_LIMIT_REACHED',
        recipientId: mockStore.accountId._id.toString(),
        channels: ['in_app'],
        variables: expect.objectContaining({
          dailyLimit: '100',
        }),
      });
    });

    it('should not send notification when store is not found', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await listener.handleDailyLimitReached({
        storeId: new Types.ObjectId().toString(),
        dailyLimit: 100,
      });

      expect(notificationsService.sendFromTemplate).not.toHaveBeenCalled();
    });

    it('should handle error gracefully', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });

      await expect(
        listener.handleDailyLimitReached({
          storeId: new Types.ObjectId().toString(),
          dailyLimit: 100,
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('handleSubscriptionCancelled', () => {
    it('should log cancellation', async () => {
      const mockStore = createMockStore();
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockStore),
        }),
      });

      await expect(
        listener.handleSubscriptionCancelled({
          storeId: mockStore._id.toString(),
          reason: 'User requested',
        }),
      ).resolves.not.toThrow();
    });

    it('should not log when store is not found', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await listener.handleSubscriptionCancelled({
        storeId: new Types.ObjectId().toString(),
        reason: 'User requested',
      });
    });

    it('should handle error gracefully', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });

      await expect(
        listener.handleSubscriptionCancelled({
          storeId: new Types.ObjectId().toString(),
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('handleSubscriptionExtended', () => {
    it('should log extension', async () => {
      const mockStore = createMockStore();
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockStore),
        }),
      });

      await expect(
        listener.handleSubscriptionExtended({
          storeId: mockStore._id.toString(),
          newEndDate: new Date('2026-01-31'),
        }),
      ).resolves.not.toThrow();
    });

    it('should not log when store is not found', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await listener.handleSubscriptionExtended({
        storeId: new Types.ObjectId().toString(),
        newEndDate: new Date('2026-01-31'),
      });
    });

    it('should handle error gracefully', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('DB error')),
        }),
      });

      await expect(
        listener.handleSubscriptionExtended({
          storeId: new Types.ObjectId().toString(),
          newEndDate: new Date('2026-01-31'),
        }),
      ).resolves.not.toThrow();
    });
  });
});
