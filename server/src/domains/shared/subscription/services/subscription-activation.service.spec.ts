import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { SubscriptionActivationService } from './subscription-activation.service';
import {
  StoreSubscription,
  SubscriptionStatus,
} from '../../../../database/schemas/store-subscription.schema';
import { SubscriptionPlan } from '../../../../database/schemas/subscription-plan.schema';
import { StoreOwnerProfile } from '../../../../database/schemas/store-owner-profile.schema';
import { generateObjectId, createMockEventEmitter } from '../../testing';

describe('SubscriptionActivationService', () => {
  let service: SubscriptionActivationService;
  let subscriptionModel: any;
  let planModel: any;
  let storeProfileModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const storeId = generateObjectId();
  const planId = generateObjectId();
  const adminId = generateObjectId();

  const mockPlan = {
    _id: planId,
    name: 'Premium',
    durationDays: 30,
    features: {
      dailyProductLimit: 100,
      maxImagesPerProduct: 10,
      maxVariantsPerProduct: 5,
    },
  };

  const mockStore = {
    _id: storeId,
    hasActiveSubscription: false,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockSubscription = {
    _id: generateObjectId(),
    storeId,
    planId,
    status: SubscriptionStatus.ACTIVE,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    subscriptionModel = jest.fn().mockImplementation(() => ({
      ...mockSubscription,
      save: jest.fn().mockResolvedValue(mockSubscription),
    }));
    subscriptionModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    planModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockPlan) }),
    };

    storeProfileModel = {
      findById: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockStore) }),
    };

    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionActivationService,
        {
          provide: getModelToken(StoreSubscription.name),
          useValue: subscriptionModel,
        },
        { provide: getModelToken(SubscriptionPlan.name), useValue: planModel },
        {
          provide: getModelToken(StoreOwnerProfile.name),
          useValue: storeProfileModel,
        },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<SubscriptionActivationService>(
      SubscriptionActivationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      storeId,
      planId,
      paymentMethod: 'cash',
      amountPaid: 100,
    };

    it('should create subscription', async () => {
      const result = await service.create(createDto, adminId);

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'subscription.activated',
        expect.any(Object),
      );
    });

    it('should throw if plan not found', async () => {
      planModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(createDto, adminId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if store not found', async () => {
      storeProfileModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.create(createDto, adminId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if store has active subscription', async () => {
      subscriptionModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubscription),
      });

      await expect(service.create(createDto, adminId)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('updateStoreProfile', () => {
    it('should update store profile with subscription details', async () => {
      const endDate = new Date();

      await service.updateStoreProfile(
        mockStore as any,
        mockPlan as any,
        endDate,
      );

      expect(mockStore.save).toHaveBeenCalled();
      expect(mockStore.hasActiveSubscription).toBe(true);
    });
  });
});
