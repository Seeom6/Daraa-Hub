import { Test, TestingModule } from '@nestjs/testing';
import { StoreAnalyticsService } from './store-analytics.service';
import { StoreAnalyticsRepository } from '../repositories/analytics.repository';
import { generateObjectId } from '../../testing';

describe('StoreAnalyticsService', () => {
  let service: StoreAnalyticsService;

  const mockModel = {
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
    aggregate: jest.fn(),
  };

  const mockRepository = {
    getModel: jest.fn().mockReturnValue(mockModel),
    count: jest.fn(),
    findOne: jest.fn(),
  };

  const storeId = generateObjectId();

  const mockAnalytics = {
    _id: generateObjectId(),
    storeId,
    totalOrders: 50,
    totalRevenue: 50000,
    totalCommission: 5000,
    netRevenue: 45000,
    averageOrderValue: 1000,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreAnalyticsService,
        { provide: StoreAnalyticsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<StoreAnalyticsService>(StoreAnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStoreAnalytics', () => {
    it('should update analytics and calculate derived metrics', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(mockAnalytics);

      const result = await service.updateStoreAnalytics(
        storeId,
        'daily' as any,
        { totalOrders: 1 },
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
      expect(mockAnalytics.save).toHaveBeenCalled();
    });
  });

  describe('getStoreAnalytics', () => {
    it('should return paginated analytics', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAnalytics]),
      });
      mockRepository.count.mockResolvedValue(1);

      const result = await service.getStoreAnalytics({
        page: 1,
        limit: 10,
      } as any);

      expect(result.data).toEqual([mockAnalytics]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by storeId', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAnalytics]),
      });
      mockRepository.count.mockResolvedValue(1);

      const result = await service.getStoreAnalytics({ storeId } as any);

      expect(result.data).toEqual([mockAnalytics]);
    });

    it('should filter by period', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAnalytics]),
      });
      mockRepository.count.mockResolvedValue(1);

      const result = await service.getStoreAnalytics({
        period: 'daily',
      } as any);

      expect(result.data).toEqual([mockAnalytics]);
    });

    it('should filter by startDate only', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAnalytics]),
      });
      mockRepository.count.mockResolvedValue(1);

      const result = await service.getStoreAnalytics({
        startDate: '2024-01-01',
      } as any);

      expect(result.data).toEqual([mockAnalytics]);
    });

    it('should filter by endDate only', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAnalytics]),
      });
      mockRepository.count.mockResolvedValue(1);

      const result = await service.getStoreAnalytics({
        endDate: '2024-12-31',
      } as any);

      expect(result.data).toEqual([mockAnalytics]);
    });

    it('should filter by date range', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAnalytics]),
      });
      mockRepository.count.mockResolvedValue(1);

      const result = await service.getStoreAnalytics({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      } as any);

      expect(result.data).toEqual([mockAnalytics]);
    });

    it('should use default page and limit', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAnalytics]),
      });
      mockRepository.count.mockResolvedValue(1);

      const result = await service.getStoreAnalytics({} as any);

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should return store dashboard for store_owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockAnalytics);

      const result = await service.getDashboardMetrics(storeId, 'store_owner');

      expect(result.today).toBeDefined();
      expect(result.monthly).toBeDefined();
    });

    it('should return empty objects when no analytics found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getDashboardMetrics(storeId, 'store_owner');

      expect(result.today).toEqual({});
      expect(result.monthly).toEqual({});
    });

    it('should return admin dashboard for admin', async () => {
      mockModel.aggregate.mockResolvedValue([
        { totalOrders: 100, totalRevenue: 100000 },
      ]);

      const result = await service.getDashboardMetrics(storeId, 'admin');

      expect(result.totalOrders).toBe(100);
    });

    it('should return empty object when no admin stats', async () => {
      mockModel.aggregate.mockResolvedValue([]);

      const result = await service.getDashboardMetrics(storeId, 'admin');

      expect(result).toEqual({});
    });

    it('should return empty object for unknown role', async () => {
      const result = await service.getDashboardMetrics(storeId, 'customer');

      expect(result).toEqual({});
    });
  });

  describe('updateStoreAnalytics with zero orders', () => {
    it('should not calculate average when totalOrders is 0', async () => {
      const zeroOrdersAnalytics = {
        ...mockAnalytics,
        totalOrders: 0,
        save: jest.fn().mockResolvedValue(this),
      };
      mockModel.findOneAndUpdate.mockResolvedValue(zeroOrdersAnalytics);

      const result = await service.updateStoreAnalytics(
        storeId,
        'daily' as any,
        { totalRevenue: 100 },
      );

      expect(zeroOrdersAnalytics.save).toHaveBeenCalled();
    });
  });

  describe('updateStoreAnalytics with weekly period', () => {
    it('should calculate weekly period start date', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(mockAnalytics);

      const result = await service.updateStoreAnalytics(
        storeId,
        'weekly' as any,
        { totalOrders: 1 },
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('updateStoreAnalytics with monthly period', () => {
    it('should calculate monthly period start date', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(mockAnalytics);

      const result = await service.updateStoreAnalytics(
        storeId,
        'monthly' as any,
        { totalOrders: 1 },
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
