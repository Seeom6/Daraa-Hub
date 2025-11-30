import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SubscriptionPlanRepository } from './subscription-plan.repository';
import { SubscriptionPlan } from '../../../../database/schemas/subscription-plan.schema';
import { MockModelFactory, generateObjectId } from '../../testing';

describe('SubscriptionPlanRepository', () => {
  let repository: SubscriptionPlanRepository;
  let mockModel: any;

  const planId = generateObjectId();

  const mockPlan = {
    _id: planId,
    name: 'Premium',
    price: 99,
    duration: 30,
    isActive: true,
    subscriberCount: 50,
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockPlan]);
    mockModel.findByIdAndUpdate = jest.fn().mockResolvedValue(mockPlan);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionPlanRepository,
        { provide: getModelToken(SubscriptionPlan.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<SubscriptionPlanRepository>(
      SubscriptionPlanRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByName', () => {
    it('should find plan by name', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      });

      const result = await repository.findByName('Premium');

      expect(result).toEqual(mockPlan);
    });
  });

  describe('findActivePlans', () => {
    it('should find active plans', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPlan]),
      });

      const result = await repository.findActivePlans();

      expect(result).toEqual([mockPlan]);
    });
  });

  describe('findByPriceRange', () => {
    it('should find plans by price range', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockPlan]),
      });

      const result = await repository.findByPriceRange(50, 150);

      expect(result).toEqual([mockPlan]);
    });
  });

  describe('toggleActive', () => {
    it('should toggle plan active status', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      });

      const result = await repository.toggleActive(planId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should return null if plan not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.toggleActive(planId);

      expect(result).toBeNull();
    });
  });

  describe('getMostPopular', () => {
    it('should return most popular plan', async () => {
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPlan),
      });

      const result = await repository.getMostPopular();

      expect(result).toEqual(mockPlan);
    });
  });

  describe('incrementSubscribers', () => {
    it('should increment subscriber count', async () => {
      const result = await repository.incrementSubscribers(planId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('decrementSubscribers', () => {
    it('should decrement subscriber count', async () => {
      const result = await repository.decrementSubscribers(planId);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
