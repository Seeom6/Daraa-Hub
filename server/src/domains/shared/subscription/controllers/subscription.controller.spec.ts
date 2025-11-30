import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from '../services/subscription.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { SubscriptionStatus } from '../../../../database/schemas/store-subscription.schema';
import { generateObjectId } from '../../testing';

describe('SubscriptionController', () => {
  let controller: SubscriptionController;
  let subscriptionService: jest.Mocked<SubscriptionService>;

  const userId = generateObjectId();
  const storeId = generateObjectId();
  const mockUser = { userId };

  const mockSubscription = {
    _id: generateObjectId(),
    storeId,
    status: SubscriptionStatus.ACTIVE,
  };

  beforeEach(async () => {
    subscriptionService = {
      create: jest.fn().mockResolvedValue(mockSubscription),
      findAll: jest.fn().mockResolvedValue({
        data: [mockSubscription],
        total: 1,
        page: 1,
        limit: 20,
      }),
      findOne: jest.fn().mockResolvedValue(mockSubscription),
      getActiveSubscription: jest.fn().mockResolvedValue(mockSubscription),
      getStoreSubscriptions: jest.fn().mockResolvedValue([mockSubscription]),
      update: jest.fn().mockResolvedValue(mockSubscription),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [
        { provide: SubscriptionService, useValue: subscriptionService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<SubscriptionController>(SubscriptionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create subscription', async () => {
      const createDto = {
        storeId,
        planId: generateObjectId(),
        paymentMethod: 'cash',
        amountPaid: 100,
      };

      const result = await controller.create(createDto, mockUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription created successfully');
      expect(subscriptionService.create).toHaveBeenCalledWith(
        createDto,
        userId,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated subscriptions', async () => {
      const result = await controller.findAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockSubscription]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      await controller.findAll(SubscriptionStatus.ACTIVE);

      expect(subscriptionService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubscriptionStatus.ACTIVE,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return subscription by ID', async () => {
      const result = await controller.findOne(mockSubscription._id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSubscription);
    });
  });

  describe('getActiveSubscription', () => {
    it('should return active subscription for store', async () => {
      const result = await controller.getActiveSubscription(storeId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockSubscription);
    });
  });

  describe('getStoreSubscriptions', () => {
    it('should return all subscriptions for store', async () => {
      const result = await controller.getStoreSubscriptions(storeId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockSubscription]);
    });
  });

  describe('update', () => {
    it('should update subscription', async () => {
      const updateDto = { autoRenew: true };

      const result = await controller.update(
        mockSubscription._id,
        updateDto,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Subscription updated successfully');
      expect(subscriptionService.update).toHaveBeenCalledWith(
        mockSubscription._id,
        updateDto,
        userId,
      );
    });
  });

  describe('findAll with filters', () => {
    it('should filter by storeId', async () => {
      await controller.findAll(undefined, storeId);

      expect(subscriptionService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId,
        }),
      );
    });

    it('should use custom page and limit', async () => {
      await controller.findAll(undefined, undefined, 2, 50);

      expect(subscriptionService.findAll).toHaveBeenCalledWith({
        status: undefined,
        storeId: undefined,
        page: 2,
        limit: 50,
      });
    });

    it('should use default page and limit when not provided', async () => {
      await controller.findAll();

      expect(subscriptionService.findAll).toHaveBeenCalledWith({
        status: undefined,
        storeId: undefined,
        page: 1,
        limit: 20,
      });
    });

    it('should filter by status and storeId together', async () => {
      await controller.findAll(SubscriptionStatus.EXPIRED, storeId);

      expect(subscriptionService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: SubscriptionStatus.EXPIRED,
          storeId,
        }),
      );
    });
  });
});
