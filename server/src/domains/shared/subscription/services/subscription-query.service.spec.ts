import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SubscriptionQueryService } from './subscription-query.service';
import {
  StoreSubscription,
  SubscriptionStatus,
} from '../../../../database/schemas/store-subscription.schema';
import { generateObjectId } from '../../testing';

describe('SubscriptionQueryService', () => {
  let service: SubscriptionQueryService;
  let subscriptionModel: any;

  const subscriptionId = generateObjectId();
  const storeId = generateObjectId();

  const mockSubscription = {
    _id: subscriptionId,
    storeId,
    status: SubscriptionStatus.ACTIVE,
  };

  beforeEach(async () => {
    subscriptionModel = {
      findById: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockSubscription),
          }),
        }),
      }),
      findOne: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSubscription),
        }),
      }),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockSubscription]),
              skip: jest.fn().mockReturnValue({
                limit: jest.fn().mockReturnValue({
                  exec: jest.fn().mockResolvedValue([mockSubscription]),
                }),
              }),
            }),
          }),
          sort: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([mockSubscription]),
          }),
        }),
      }),
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionQueryService,
        {
          provide: getModelToken(StoreSubscription.name),
          useValue: subscriptionModel,
        },
      ],
    }).compile();

    service = module.get<SubscriptionQueryService>(SubscriptionQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return subscription by ID', async () => {
      const result = await service.findOne(subscriptionId);

      expect(result).toEqual(mockSubscription);
    });

    it('should throw for invalid ID', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if not found', async () => {
      subscriptionModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(null),
          }),
        }),
      });

      await expect(service.findOne(subscriptionId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getActiveSubscription', () => {
    it('should return active subscription for store', async () => {
      const result = await service.getActiveSubscription(storeId);

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('getStoreSubscriptions', () => {
    it('should return all subscriptions for store', async () => {
      const result = await service.getStoreSubscriptions(storeId);

      expect(result).toEqual([mockSubscription]);
    });
  });

  describe('findAll', () => {
    it('should return paginated subscriptions', async () => {
      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual([mockSubscription]);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      await service.findAll({ status: SubscriptionStatus.ACTIVE });

      expect(subscriptionModel.find).toHaveBeenCalled();
    });

    it('should filter by store ID', async () => {
      await service.findAll({ storeId });

      expect(subscriptionModel.find).toHaveBeenCalled();
    });
  });
});
