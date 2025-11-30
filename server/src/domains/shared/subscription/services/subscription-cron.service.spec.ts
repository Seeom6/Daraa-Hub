import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionCronService } from './subscription-cron.service';
import {
  StoreSubscription,
  SubscriptionStatus,
} from '../../../../database/schemas/store-subscription.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { SystemSettings } from '../../../../database/schemas/system-settings.schema';
import { generateObjectId } from '../../testing';

describe('SubscriptionCronService', () => {
  let service: SubscriptionCronService;
  let mockSubscriptionModel: any;
  let mockStoreProfileModel: any;
  let mockSettingsModel: any;
  let mockEventEmitter: any;

  const mockSubscription = {
    _id: generateObjectId(),
    storeId: generateObjectId(),
    planId: { name: 'Premium' },
    status: SubscriptionStatus.ACTIVE,
    endDate: new Date(Date.now() - 1000),
    save: jest.fn().mockResolvedValue(true),
  };

  const mockStore = {
    _id: generateObjectId(),
    hasActiveSubscription: true,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockSubscriptionModel = {
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockSubscription]),
      }),
    };

    mockStoreProfileModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockStore) }),
    };

    mockSettingsModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          value: {
            subscriptionSystemEnabled: true,
            notificationSettings: { subscriptionExpiryWarningDays: 3 },
          },
        }),
      }),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionCronService,
        {
          provide: getModelToken(StoreSubscription.name),
          useValue: mockSubscriptionModel,
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreProfileModel,
        },
        {
          provide: getModelToken(SystemSettings.name),
          useValue: mockSettingsModel,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<SubscriptionCronService>(SubscriptionCronService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkExpiredSubscriptions', () => {
    it('should process expired subscriptions', async () => {
      await service.checkExpiredSubscriptions();

      expect(mockSubscription.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'subscription.expired',
        expect.any(Object),
      );
    });

    it('should skip if subscription system disabled', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: false } }),
      });

      await service.checkExpiredSubscriptions();

      expect(mockSubscriptionModel.find).not.toHaveBeenCalled();
    });

    it('should update store profile when subscription expires', async () => {
      await service.checkExpiredSubscriptions();

      expect(mockStore.save).toHaveBeenCalled();
      expect(mockStore.hasActiveSubscription).toBe(false);
    });

    it('should handle when store is not found', async () => {
      mockStoreProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.checkExpiredSubscriptions();

      expect(mockSubscription.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'subscription.expired',
        expect.any(Object),
      );
    });

    it('should handle when no expired subscriptions found', async () => {
      mockSubscriptionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      await service.checkExpiredSubscriptions();

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should handle subscription with no planId name', async () => {
      const subscriptionWithoutPlanName = {
        ...mockSubscription,
        planId: null,
      };
      mockSubscriptionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([subscriptionWithoutPlanName]),
      });

      await service.checkExpiredSubscriptions();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'subscription.expired',
        {
          storeId: expect.any(String),
          planName: 'Unknown',
        },
      );
    });

    it('should skip when settings is null', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.checkExpiredSubscriptions();

      expect(mockSubscriptionModel.find).not.toHaveBeenCalled();
    });
  });

  describe('checkExpiringSoonSubscriptions', () => {
    it('should send warnings for expiring subscriptions', async () => {
      const expiringSubscription = {
        ...mockSubscription,
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      };
      mockSubscriptionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([expiringSubscription]),
      });

      await service.checkExpiringSoonSubscriptions();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'subscription.expiryWarning',
        expect.any(Object),
      );
    });

    it('should skip if subscription system disabled', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: false } }),
      });

      await service.checkExpiringSoonSubscriptions();

      expect(mockSubscriptionModel.find).not.toHaveBeenCalled();
    });

    it('should handle when no expiring subscriptions found', async () => {
      mockSubscriptionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      await service.checkExpiringSoonSubscriptions();

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should use default warning days when not configured', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          value: { subscriptionSystemEnabled: true },
        }),
      });
      mockSubscriptionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      await service.checkExpiringSoonSubscriptions();

      expect(mockSubscriptionModel.find).toHaveBeenCalled();
    });

    it('should handle subscription with no planId name', async () => {
      const expiringSubscription = {
        ...mockSubscription,
        planId: null,
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      };
      mockSubscriptionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([expiringSubscription]),
      });

      await service.checkExpiringSoonSubscriptions();

      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'subscription.expiryWarning',
        {
          storeId: expect.any(String),
          planName: 'Unknown',
          daysLeft: expect.any(Number),
          expiryDate: expect.any(String),
        },
      );
    });

    it('should skip when settings is null', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.checkExpiringSoonSubscriptions();

      expect(mockSubscriptionModel.find).not.toHaveBeenCalled();
    });
  });

  describe('resetDailyUsageCounters', () => {
    it('should log reset message', async () => {
      await expect(service.resetDailyUsageCounters()).resolves.not.toThrow();
    });
  });
});
