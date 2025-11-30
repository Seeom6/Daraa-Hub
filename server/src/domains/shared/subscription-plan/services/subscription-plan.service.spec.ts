import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { SubscriptionPlanService } from './subscription-plan.service';
import { SubscriptionPlan } from '../../../../database/schemas/subscription-plan.schema';
import { generateObjectId } from '../../testing';

describe('SubscriptionPlanService', () => {
  let service: SubscriptionPlanService;

  const mockPlanModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    insertMany: jest.fn(),
  };

  const planId = generateObjectId();

  const mockPlan = {
    _id: planId,
    name: 'Premium',
    type: 'premium',
    price: 5000,
    isActive: true,
    save: jest.fn().mockResolvedValue(this),
    deleteOne: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionPlanService,
        {
          provide: getModelToken(SubscriptionPlan.name),
          useValue: mockPlanModel,
        },
      ],
    }).compile();

    service = module.get<SubscriptionPlanService>(SubscriptionPlanService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all plans', async () => {
      mockPlanModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPlan]),
      });

      const result = await service.findAll();

      expect(result).toEqual([mockPlan]);
    });

    it('should filter active only', async () => {
      mockPlanModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPlan]),
      });

      await service.findAll(true);

      expect(mockPlanModel.find).toHaveBeenCalledWith({ isActive: true });
    });
  });

  describe('findOne', () => {
    it('should return plan by id', async () => {
      mockPlanModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      });

      const result = await service.findOne(planId);

      expect(result).toEqual(mockPlan);
    });

    it('should throw if invalid id', async () => {
      await expect(service.findOne('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if not found', async () => {
      mockPlanModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(planId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByType', () => {
    it('should return plan by type', async () => {
      mockPlanModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      });

      const result = await service.findByType('premium' as any);

      expect(result).toEqual(mockPlan);
    });

    it('should throw if not found', async () => {
      mockPlanModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByType('unknown' as any)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete plan', async () => {
      mockPlanModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      });

      await service.remove(planId);

      expect(mockPlan.deleteOne).toHaveBeenCalled();
    });
  });

  describe('seedDefaultPlans', () => {
    it('should seed plans when none exist', async () => {
      mockPlanModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockPlanModel.insertMany.mockResolvedValue([]);

      await service.seedDefaultPlans();

      expect(mockPlanModel.insertMany).toHaveBeenCalled();
    });

    it('should skip seeding when plans exist', async () => {
      mockPlanModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      await service.seedDefaultPlans();

      expect(mockPlanModel.insertMany).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create new plan', async () => {
      mockPlanModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockNewPlan = {
        ...mockPlan,
        save: jest.fn().mockResolvedValue(mockPlan),
      };

      // Mock the constructor
      const originalModel = mockPlanModel;
      const MockModel = jest.fn().mockImplementation(() => mockNewPlan);
      Object.assign(MockModel, originalModel);

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SubscriptionPlanService,
          {
            provide: getModelToken(SubscriptionPlan.name),
            useValue: MockModel,
          },
        ],
      }).compile();

      const testService = module.get<SubscriptionPlanService>(
        SubscriptionPlanService,
      );
      MockModel.findOne = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

      const result = await testService.create({
        name: 'New Plan',
        type: 'basic',
      } as any);

      expect(result).toBeDefined();
    });

    it('should throw if plan type exists', async () => {
      mockPlanModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPlan),
      });

      await expect(
        service.create({ name: 'Test', type: 'premium' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update plan', async () => {
      const updatedPlan = {
        ...mockPlan,
        name: 'Updated',
        save: jest.fn().mockResolvedValue({ ...mockPlan, name: 'Updated' }),
      };
      mockPlanModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPlan),
      });

      const result = await service.update(planId, { name: 'Updated' } as any);

      expect(result.name).toBe('Updated');
    });

    it('should throw if changing to existing type', async () => {
      const existingPlan = { ...mockPlan, type: 'basic' };
      mockPlanModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(existingPlan),
      });
      mockPlanModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ ...mockPlan, type: 'premium' }),
      });

      await expect(
        service.update(planId, { type: 'premium' } as any),
      ).rejects.toThrow(ConflictException);
    });
  });
});
