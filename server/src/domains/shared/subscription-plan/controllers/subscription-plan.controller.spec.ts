import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionPlanController } from './subscription-plan.controller';
import { SubscriptionPlanService } from '../services/subscription-plan.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { generateObjectId } from '../../testing';

describe('SubscriptionPlanController', () => {
  let controller: SubscriptionPlanController;
  let planService: jest.Mocked<SubscriptionPlanService>;

  const mockPlan = {
    _id: generateObjectId(),
    name: 'Premium Plan',
    price: 99.99,
    duration: 30,
    isActive: true,
  };

  beforeEach(async () => {
    planService = {
      findAll: jest.fn().mockResolvedValue([mockPlan]),
      findOne: jest.fn().mockResolvedValue(mockPlan),
      create: jest.fn().mockResolvedValue(mockPlan),
      update: jest.fn().mockResolvedValue(mockPlan),
      remove: jest.fn().mockResolvedValue(undefined),
      seedDefaultPlans: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionPlanController],
      providers: [{ provide: SubscriptionPlanService, useValue: planService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubscriptionPlanController>(
      SubscriptionPlanController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all plans', async () => {
      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockPlan]);
      expect(planService.findAll).toHaveBeenCalledWith(false);
    });

    it('should filter active plans only', async () => {
      await controller.findAll('true');

      expect(planService.findAll).toHaveBeenCalledWith(true);
    });
  });

  describe('findOne', () => {
    it('should return plan by ID', async () => {
      const result = await controller.findOne(mockPlan._id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPlan);
    });
  });

  describe('create', () => {
    it('should create plan', async () => {
      const createDto = { name: 'Premium Plan', price: 99.99, duration: 30 };

      const result = await controller.create(createDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription plan created successfully');
    });
  });

  describe('update', () => {
    it('should update plan', async () => {
      const updateDto = { price: 149.99 };

      const result = await controller.update(mockPlan._id, updateDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription plan updated successfully');
    });
  });

  describe('remove', () => {
    it('should remove plan', async () => {
      await controller.remove(mockPlan._id);

      expect(planService.remove).toHaveBeenCalledWith(mockPlan._id);
    });
  });

  describe('seedDefault', () => {
    it('should seed default plans', async () => {
      const result = await controller.seedDefault();

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'Default subscription plans seeded successfully',
      );
    });
  });
});
