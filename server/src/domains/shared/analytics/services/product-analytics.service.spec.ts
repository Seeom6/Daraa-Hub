import { Test, TestingModule } from '@nestjs/testing';
import { ProductAnalyticsService } from './product-analytics.service';
import { ProductAnalyticsRepository } from '../repositories/analytics.repository';
import { generateObjectId } from '../../testing';

describe('ProductAnalyticsService', () => {
  let service: ProductAnalyticsService;

  const mockModel = {
    findOneAndUpdate: jest.fn(),
    find: jest.fn(),
  };

  const mockRepository = {
    getModel: jest.fn().mockReturnValue(mockModel),
    count: jest.fn(),
  };

  const productId = generateObjectId();
  const storeId = generateObjectId();

  const mockAnalytics = {
    _id: generateObjectId(),
    productId,
    storeId,
    views: 100,
    purchaseCount: 10,
    conversionRate: 10,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductAnalyticsService,
        { provide: ProductAnalyticsRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ProductAnalyticsService>(ProductAnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateProductAnalytics', () => {
    it('should update analytics and calculate conversion rate', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(mockAnalytics);

      const result = await service.updateProductAnalytics(
        productId,
        storeId,
        'daily' as any,
        { views: 1 },
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
      expect(mockAnalytics.save).toHaveBeenCalled();
    });
  });

  describe('getProductAnalytics', () => {
    it('should return paginated analytics', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockAnalytics]),
      });
      mockRepository.count.mockResolvedValue(1);

      const result = await service.getProductAnalytics({
        page: 1,
        limit: 10,
      } as any);

      expect(result.data).toEqual([mockAnalytics]);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by productId and storeId', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });
      mockRepository.count.mockResolvedValue(0);

      const result = await service.getProductAnalytics({
        productId,
        storeId,
        period: 'daily',
      } as any);

      expect(result.data).toEqual([]);
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

      const result = await service.getProductAnalytics({
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

      const result = await service.getProductAnalytics({
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

      const result = await service.getProductAnalytics({
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

      const result = await service.getProductAnalytics({} as any);

      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('updateProductAnalytics with zero views', () => {
    it('should not calculate conversion rate when views is 0', async () => {
      const zeroViewsAnalytics = {
        ...mockAnalytics,
        views: 0,
        save: jest.fn().mockResolvedValue(this),
      };
      mockModel.findOneAndUpdate.mockResolvedValue(zeroViewsAnalytics);

      const result = await service.updateProductAnalytics(
        productId,
        storeId,
        'daily' as any,
        { purchaseCount: 1 },
      );

      expect(zeroViewsAnalytics.save).not.toHaveBeenCalled();
    });
  });

  describe('updateProductAnalytics with weekly period', () => {
    it('should calculate weekly period start date', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(mockAnalytics);

      const result = await service.updateProductAnalytics(
        productId,
        storeId,
        'weekly' as any,
        { views: 1 },
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('updateProductAnalytics with monthly period', () => {
    it('should calculate monthly period start date', async () => {
      mockModel.findOneAndUpdate.mockResolvedValue(mockAnalytics);

      const result = await service.updateProductAnalytics(
        productId,
        storeId,
        'monthly' as any,
        { views: 1 },
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });
});
