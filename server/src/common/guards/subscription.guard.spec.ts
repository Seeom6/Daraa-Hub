import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionGuard } from './subscription.guard';
import { StoreOwnerProfile } from '../../database/schemas/store-owner-profile.schema';
import {
  StoreSubscription,
  SubscriptionStatus,
} from '../../database/schemas/store-subscription.schema';
import { SystemSettings } from '../../database/schemas/system-settings.schema';
import { Types } from 'mongoose';

describe('SubscriptionGuard', () => {
  let guard: SubscriptionGuard;

  const mockStoreProfileModel = {
    findOne: jest.fn(),
  };

  const mockSubscriptionModel = {
    findOne: jest.fn(),
  };

  const mockSettingsModel = {
    findOne: jest.fn(),
  };

  const createMockContext = (user?: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionGuard,
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: mockStoreProfileModel,
        },
        {
          provide: getModelToken(StoreSubscription.name),
          useValue: mockSubscriptionModel,
        },
        {
          provide: getModelToken(SystemSettings.name),
          useValue: mockSettingsModel,
        },
      ],
    }).compile();

    guard = module.get<SubscriptionGuard>(SubscriptionGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for non-store_owner users', async () => {
      const context = createMockContext({
        role: 'customer',
        userId: 'user-123',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when no user is present', async () => {
      const context = createMockContext(null);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when subscription system is disabled', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: false } }),
      });
      const context = createMockContext({
        role: 'store_owner',
        userId: 'user-123',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when store profile not found', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      mockStoreProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const context = createMockContext({
        role: 'store_owner',
        userId: 'user-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when store has no active subscription', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      mockStoreProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ hasActiveSubscription: false }),
      });
      const context = createMockContext({
        role: 'store_owner',
        userId: 'user-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Your subscription has expired',
      );
    });

    it('should throw ForbiddenException when no active subscription found', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      mockStoreProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          hasActiveSubscription: true,
        }),
      });
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });
      const context = createMockContext({
        role: 'store_owner',
        userId: 'user-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'No active subscription found',
      );
    });

    it('should throw ForbiddenException when subscription has expired', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      mockStoreProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          hasActiveSubscription: true,
        }),
      });
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ endDate: pastDate }),
        }),
      });
      const context = createMockContext({
        role: 'store_owner',
        userId: 'user-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Your subscription has expired',
      );
    });

    it('should throw ForbiddenException when daily limit reached', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      mockStoreProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          _id: new Types.ObjectId(),
          hasActiveSubscription: true,
          dailyProductLimit: 5,
        }),
      });
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({
            endDate: futureDate,
            getTodayUsage: () => 5,
          }),
        }),
      });
      const context = createMockContext({
        role: 'store_owner',
        userId: 'user-123',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Daily product limit reached',
      );
    });

    it('should return true and attach subscription info when valid', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      const storeProfile = {
        _id: new Types.ObjectId(),
        hasActiveSubscription: true,
        dailyProductLimit: 10,
      };
      const subscription = {
        endDate: futureDate,
        getTodayUsage: () => 3,
      };

      mockSettingsModel.findOne.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ value: { subscriptionSystemEnabled: true } }),
      });
      mockStoreProfileModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(storeProfile),
      });
      mockSubscriptionModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(subscription),
        }),
      });

      const request: any = {
        user: { role: 'store_owner', userId: 'user-123' },
      };
      const context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: () => jest.fn(),
        getClass: () => jest.fn(),
      } as unknown as ExecutionContext;

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.subscription).toBe(subscription);
      expect(request.storeProfile).toBe(storeProfile);
    });

    it('should return true when settings is null (subscription disabled)', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const context = createMockContext({
        role: 'store_owner',
        userId: 'user-123',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when settings value is null', async () => {
      mockSettingsModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ value: null }),
      });
      const context = createMockContext({
        role: 'store_owner',
        userId: 'user-123',
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
