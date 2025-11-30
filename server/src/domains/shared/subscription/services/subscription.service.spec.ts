import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionService } from './subscription.service';
import { SubscriptionActivationService } from './subscription-activation.service';
import { SubscriptionManagementService } from './subscription-management.service';
import { SubscriptionQueryService } from './subscription-query.service';
import { generateObjectId } from '../../testing';

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  const mockActivationService = {
    create: jest.fn(),
  };

  const mockManagementService = {
    update: jest.fn(),
    checkExpiredSubscriptions: jest.fn(),
  };

  const mockQueryService = {
    findOne: jest.fn(),
    getActiveSubscription: jest.fn(),
    getStoreSubscriptions: jest.fn(),
    findAll: jest.fn(),
  };

  const subscriptionId = generateObjectId();
  const storeId = generateObjectId();
  const adminId = generateObjectId();

  const mockSubscription = {
    _id: subscriptionId,
    storeId,
    planId: generateObjectId(),
    status: 'active',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        {
          provide: SubscriptionActivationService,
          useValue: mockActivationService,
        },
        {
          provide: SubscriptionManagementService,
          useValue: mockManagementService,
        },
        { provide: SubscriptionQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to activation service', async () => {
      mockActivationService.create.mockResolvedValue(mockSubscription);

      const result = await service.create(
        { storeId, planId: generateObjectId() } as any,
        adminId,
      );

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('update', () => {
    it('should delegate to management service', async () => {
      mockQueryService.findOne.mockResolvedValue(mockSubscription);
      mockManagementService.update.mockResolvedValue({
        ...mockSubscription,
        status: 'cancelled',
      });

      const result = await service.update(
        subscriptionId,
        { status: 'cancelled' } as any,
        adminId,
      );

      expect(result.status).toBe('cancelled');
    });
  });

  describe('checkExpiredSubscriptions', () => {
    it('should delegate to management service', async () => {
      mockManagementService.checkExpiredSubscriptions.mockResolvedValue(
        undefined,
      );

      await service.checkExpiredSubscriptions();

      expect(
        mockManagementService.checkExpiredSubscriptions,
      ).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findOne.mockResolvedValue(mockSubscription);

      const result = await service.findOne(subscriptionId);

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('getActiveSubscription', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getActiveSubscription.mockResolvedValue(
        mockSubscription,
      );

      const result = await service.getActiveSubscription(storeId);

      expect(result).toEqual(mockSubscription);
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockSubscription],
        total: 1,
        page: 1,
        limit: 10,
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockSubscription]);
    });

    it('should pass filters to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await service.findAll({
        status: 'active' as any,
        storeId,
        page: 2,
        limit: 20,
      });

      expect(mockQueryService.findAll).toHaveBeenCalledWith({
        status: 'active',
        storeId,
        page: 2,
        limit: 20,
      });
    });

    it('should work without filters', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await service.findAll();

      expect(mockQueryService.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getStoreSubscriptions', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getStoreSubscriptions.mockResolvedValue([
        mockSubscription,
      ]);

      const result = await service.getStoreSubscriptions(storeId);

      expect(result).toEqual([mockSubscription]);
      expect(mockQueryService.getStoreSubscriptions).toHaveBeenCalledWith(
        storeId,
      );
    });
  });
});
