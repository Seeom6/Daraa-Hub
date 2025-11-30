import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { UserActivityService } from './user-activity.service';
import { ProductAnalyticsService } from './product-analytics.service';
import { StoreAnalyticsService } from './store-analytics.service';
import { generateObjectId } from '../../testing';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  const mockUserActivityService = {
    trackEvent: jest.fn(),
    getUserActivity: jest.fn(),
  };

  const mockProductAnalyticsService = {
    updateProductAnalytics: jest.fn(),
    getProductAnalytics: jest.fn(),
  };

  const mockStoreAnalyticsService = {
    updateStoreAnalytics: jest.fn(),
    getStoreAnalytics: jest.fn(),
    getDashboardMetrics: jest.fn(),
  };

  const userId = generateObjectId();
  const productId = generateObjectId();
  const storeId = generateObjectId();

  const mockActivity = {
    _id: generateObjectId(),
    userId,
    eventType: 'page_view',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: UserActivityService, useValue: mockUserActivityService },
        {
          provide: ProductAnalyticsService,
          useValue: mockProductAnalyticsService,
        },
        { provide: StoreAnalyticsService, useValue: mockStoreAnalyticsService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should delegate to user activity service', async () => {
      mockUserActivityService.trackEvent.mockResolvedValue(mockActivity);

      const result = await service.trackEvent(userId, {
        eventType: 'page_view',
      } as any);

      expect(result).toEqual(mockActivity);
    });
  });

  describe('getUserActivity', () => {
    it('should delegate to user activity service', async () => {
      mockUserActivityService.getUserActivity.mockResolvedValue({
        data: [mockActivity],
        meta: {},
      });

      const result = await service.getUserActivity(userId, {} as any);

      expect(result.data).toEqual([mockActivity]);
    });
  });

  describe('updateProductAnalytics', () => {
    it('should delegate to product analytics service', async () => {
      mockProductAnalyticsService.updateProductAnalytics.mockResolvedValue({
        productId,
      });

      const result = await service.updateProductAnalytics(
        productId,
        storeId,
        'daily' as any,
        {},
      );

      expect(result.productId).toBe(productId);
    });
  });

  describe('getProductAnalytics', () => {
    it('should delegate to product analytics service', async () => {
      mockProductAnalyticsService.getProductAnalytics.mockResolvedValue({
        data: [],
        meta: {},
      });

      const result = await service.getProductAnalytics({} as any);

      expect(result.data).toEqual([]);
    });
  });

  describe('updateStoreAnalytics', () => {
    it('should delegate to store analytics service', async () => {
      mockStoreAnalyticsService.updateStoreAnalytics.mockResolvedValue({
        storeId,
      });

      const result = await service.updateStoreAnalytics(
        storeId,
        'daily' as any,
        {},
      );

      expect(result.storeId).toBe(storeId);
    });
  });

  describe('getStoreAnalytics', () => {
    it('should delegate to store analytics service', async () => {
      mockStoreAnalyticsService.getStoreAnalytics.mockResolvedValue({
        data: [],
        meta: {},
      });

      const result = await service.getStoreAnalytics({} as any);

      expect(result.data).toEqual([]);
    });
  });

  describe('getDashboardMetrics', () => {
    it('should delegate to store analytics service', async () => {
      mockStoreAnalyticsService.getDashboardMetrics.mockResolvedValue({
        totalOrders: 100,
      });

      const result = await service.getDashboardMetrics(userId, 'admin');

      expect(result.totalOrders).toBe(100);
    });
  });
});
