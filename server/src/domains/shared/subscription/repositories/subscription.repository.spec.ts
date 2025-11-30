import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SubscriptionRepository } from './subscription.repository';
import { StoreSubscription } from '../../../../database/schemas/store-subscription.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('SubscriptionRepository', () => {
  let repository: SubscriptionRepository;
  let mockModel: any;

  const subscriptionId = generateObjectId();
  const storeId = generateObjectId();
  const planId = generateObjectId();

  const mockSubscription = {
    _id: subscriptionId,
    storeId,
    planId,
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    amount: 100,
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockSubscription]);
    mockModel.aggregate = jest
      .fn()
      .mockResolvedValue([{ _id: 'active', count: 10 }]);
    mockModel.findByIdAndUpdate = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockSubscription) });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionRepository,
        { provide: getModelToken(StoreSubscription.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<SubscriptionRepository>(SubscriptionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByStoreId', () => {
    it('should find subscription by store ID', async () => {
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockSubscription),
      });

      const result = await repository.findByStoreId(storeId);

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('findActiveByStoreId', () => {
    it('should find active subscription by store ID', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSubscription),
      });

      const result = await repository.findActiveByStoreId(storeId);

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('findByPlanId', () => {
    it('should find subscriptions by plan ID with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockSubscription]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByPlanId(planId, 1, 10);

      expect(result.data).toEqual([mockSubscription]);
    });
  });

  describe('findExpiring', () => {
    it('should find expiring subscriptions with custom days', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockSubscription]),
      });

      const result = await repository.findExpiring(14);

      expect(result).toEqual([mockSubscription]);
    });

    it('should find expiring subscriptions with default 7 days', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockSubscription]),
      });

      const result = await repository.findExpiring();

      expect(result).toEqual([mockSubscription]);
    });
  });

  describe('updateStatus', () => {
    it('should update subscription status', async () => {
      const result = await repository.updateStatus(subscriptionId, 'cancelled');

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('renewSubscription', () => {
    it('should renew subscription', async () => {
      const newEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      const result = await repository.renewSubscription(
        subscriptionId,
        newEndDate,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should return subscription statistics', async () => {
      const result = await repository.getStatistics();

      expect(mockModel.aggregate).toHaveBeenCalled();
      expect(result).toEqual([{ _id: 'active', count: 10 }]);
    });
  });

  describe('findByPlanId with default pagination', () => {
    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockSubscription]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByPlanId(planId);

      expect(result.data).toEqual([mockSubscription]);
      expect(result.total).toBe(1);
    });
  });

  describe('findActiveByStoreId when not found', () => {
    it('should return null when no active subscription', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findActiveByStoreId(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('findByStoreId when not found', () => {
    it('should return null when no subscription', async () => {
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByStoreId(generateObjectId());

      expect(result).toBeNull();
    });
  });
});
