import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProductSubscriptionService } from './product-subscription.service';
import {
  StoreSubscription,
  SubscriptionStatus,
} from '../../../../database/schemas/store-subscription.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { SystemSettings } from '../../../../database/schemas/system-settings.schema';

describe('ProductSubscriptionService', () => {
  let service: ProductSubscriptionService;
  let subscriptionModel: any;
  let storeProfileModel: any;
  let settingsModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockStoreId = new Types.ObjectId().toString();

  const mockStoreProfile = {
    _id: mockStoreId,
    hasActiveSubscription: true,
    dailyProductLimit: 10,
    maxImagesPerProduct: 5,
  };

  const mockSubscription = {
    _id: new Types.ObjectId(),
    storeId: new Types.ObjectId(mockStoreId),
    status: SubscriptionStatus.ACTIVE,
    endDate: new Date(Date.now() + 86400000), // Tomorrow
    getTodayUsage: jest.fn().mockReturnValue(5),
    incrementTodayUsage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductSubscriptionService,
        {
          provide: getModelToken(StoreSubscription.name),
          useValue: {
            findOne: jest.fn().mockReturnValue({
              populate: jest.fn().mockReturnValue({
                exec: jest.fn(),
              }),
              exec: jest.fn(),
            }),
          },
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: {
            findById: jest.fn().mockReturnValue({ exec: jest.fn() }),
          },
        },
        {
          provide: getModelToken(SystemSettings.name),
          useValue: {
            findOne: jest.fn().mockReturnValue({ exec: jest.fn() }),
          },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProductSubscriptionService>(
      ProductSubscriptionService,
    );
    subscriptionModel = module.get(getModelToken(StoreSubscription.name));
    storeProfileModel = module.get(getModelToken(StoreOwnerProfile.name));
    settingsModel = module.get(getModelToken(SystemSettings.name));
    eventEmitter = module.get(EventEmitter2);
  });

  describe('checkSubscriptionLimits', () => {
    it('should pass when subscription system is disabled', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: false } }),
      });

      await expect(
        service.checkSubscriptionLimits(mockStoreId, 3),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException when store not found', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.checkSubscriptionLimits(mockStoreId, 3),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when no active subscription', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...mockStoreProfile,
          hasActiveSubscription: false,
        }),
      });

      await expect(
        service.checkSubscriptionLimits(mockStoreId, 3),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when subscription not found', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreProfile),
      });
      subscriptionModel.findOne = jest.fn().mockReturnValue({
        populate: jest
          .fn()
          .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      });

      await expect(
        service.checkSubscriptionLimits(mockStoreId, 3),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when subscription expired', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreProfile),
      });
      subscriptionModel.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            ...mockSubscription,
            endDate: new Date(Date.now() - 86400000),
          }),
        }),
      });

      await expect(
        service.checkSubscriptionLimits(mockStoreId, 3),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when daily limit reached', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockStoreProfile, dailyProductLimit: 5 }),
      });
      subscriptionModel.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockSubscription, getTodayUsage: () => 5 }),
        }),
      });

      await expect(
        service.checkSubscriptionLimits(mockStoreId, 3),
      ).rejects.toThrow(ForbiddenException);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.dailyLimitReached',
        expect.any(Object),
      );
    });

    it('should throw ForbiddenException when image limit exceeded', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreProfile),
      });
      subscriptionModel.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockSubscription, getTodayUsage: () => 0 }),
        }),
      });

      await expect(
        service.checkSubscriptionLimits(mockStoreId, 10),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass all checks when valid', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      storeProfileModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreProfile),
      });
      subscriptionModel.findOne = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest
            .fn()
            .mockResolvedValue({ ...mockSubscription, getTodayUsage: () => 0 }),
        }),
      });

      await expect(
        service.checkSubscriptionLimits(mockStoreId, 3),
      ).resolves.not.toThrow();
    });
  });

  describe('incrementDailyUsage', () => {
    it('should skip when subscription system is disabled', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: false } }),
      });

      await service.incrementDailyUsage(mockStoreId);

      expect(subscriptionModel.findOne).not.toHaveBeenCalled();
    });

    it('should increment usage when subscription found', async () => {
      const subscription = {
        ...mockSubscription,
        incrementTodayUsage: jest.fn(),
      };
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      subscriptionModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(subscription),
      });

      await service.incrementDailyUsage(mockStoreId);

      expect(subscription.incrementTodayUsage).toHaveBeenCalled();
    });

    it('should do nothing when no subscription found', async () => {
      settingsModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      subscriptionModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.incrementDailyUsage(mockStoreId),
      ).resolves.not.toThrow();
    });
  });
});
