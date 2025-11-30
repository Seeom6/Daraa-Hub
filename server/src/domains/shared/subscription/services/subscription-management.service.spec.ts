import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubscriptionManagementService } from './subscription-management.service';
import {
  StoreSubscription,
  SubscriptionStatus,
} from '../../../../database/schemas/store-subscription.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { generateObjectId, createMockEventEmitter } from '../../testing';

describe('SubscriptionManagementService', () => {
  let service: SubscriptionManagementService;
  let subscriptionModel: any;
  let storeProfileModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const storeId = generateObjectId();
  const subscriptionId = generateObjectId();
  const adminId = generateObjectId();

  const mockStore = {
    _id: storeId,
    hasActiveSubscription: true,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockSubscription = {
    _id: subscriptionId,
    storeId,
    status: SubscriptionStatus.ACTIVE,
    endDate: new Date(),
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    subscriptionModel = {
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockSubscription]),
        }),
      }),
    };

    storeProfileModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockStore) }),
    };

    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionManagementService,
        {
          provide: getModelToken(StoreSubscription.name),
          useValue: subscriptionModel,
        },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: storeProfileModel,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<SubscriptionManagementService>(
      SubscriptionManagementService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should cancel subscription', async () => {
      const updateDto = {
        status: SubscriptionStatus.CANCELLED,
        cancellationReason: 'User request',
      };

      await service.update(mockSubscription as any, updateDto, adminId);

      expect(mockSubscription.save).toHaveBeenCalled();
      expect(mockStore.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.cancelled',
        expect.any(Object),
      );
    });

    it('should extend subscription end date', async () => {
      const newEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const updateDto = { endDate: newEndDate };

      await service.update(mockSubscription as any, updateDto, adminId);

      expect(mockSubscription.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.extended',
        expect.any(Object),
      );
    });

    it('should update auto-renew setting', async () => {
      const updateDto = { autoRenew: true };

      await service.update(mockSubscription as any, updateDto, adminId);

      expect(mockSubscription.autoRenew).toBe(true);
    });

    it('should update notes', async () => {
      const updateDto = { notes: 'Updated notes' };

      await service.update(mockSubscription as any, updateDto, adminId);

      expect(mockSubscription.notes).toBe('Updated notes');
    });
  });

  describe('checkExpiredSubscriptions', () => {
    it('should expire active subscriptions past end date', async () => {
      await service.checkExpiredSubscriptions();

      expect(mockSubscription.save).toHaveBeenCalled();
      expect(mockStore.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.expired',
        expect.any(Object),
      );
    });

    it('should handle no expired subscriptions', async () => {
      subscriptionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      await service.checkExpiredSubscriptions();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });
});
