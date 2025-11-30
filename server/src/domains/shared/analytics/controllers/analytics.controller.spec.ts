import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from '../services/analytics.service';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { generateObjectId } from '../../testing';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: jest.Mocked<AnalyticsService>;

  const userId = generateObjectId();
  const profileId = generateObjectId();
  const mockReq = {
    user: { userId, profileId, role: 'store_owner' },
    headers: { 'user-agent': 'Mozilla/5.0' },
    ip: '127.0.0.1',
  };

  const mockActivity = {
    _id: generateObjectId(),
    userId,
    eventType: 'page_view',
  };

  beforeEach(async () => {
    analyticsService = {
      trackEvent: jest.fn().mockResolvedValue(mockActivity),
      getUserActivity: jest
        .fn()
        .mockResolvedValue({ data: [mockActivity], meta: { total: 1 } }),
      getProductAnalytics: jest
        .fn()
        .mockResolvedValue({ data: [], meta: { total: 0 } }),
      getStoreAnalytics: jest
        .fn()
        .mockResolvedValue({ data: [], meta: { total: 0 } }),
      getDashboardMetrics: jest.fn().mockResolvedValue({ totalOrders: 100 }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [{ provide: AnalyticsService, useValue: analyticsService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackEvent', () => {
    it('should track event', async () => {
      const trackDto = { eventType: 'page_view', eventData: {} };

      const result = await controller.trackEvent(trackDto as any, mockReq);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Event tracked successfully');
      expect(analyticsService.trackEvent).toHaveBeenCalled();
    });
  });

  describe('getMyActivity', () => {
    it('should return user activity', async () => {
      const query = { page: 1, limit: 10 };

      const result = await controller.getMyActivity(query as any, mockReq);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockActivity]);
    });
  });

  describe('getProductAnalytics', () => {
    it('should return product analytics', async () => {
      const query = { page: 1, limit: 10 };

      const result = await controller.getProductAnalytics(
        query as any,
        mockReq,
      );

      expect(result.success).toBe(true);
      expect(analyticsService.getProductAnalytics).toHaveBeenCalled();
    });

    it('should filter by store for store owner', async () => {
      const query = {} as any;

      await controller.getProductAnalytics(query, mockReq);

      expect(query.storeId).toBe(profileId);
    });
  });

  describe('getStoreAnalytics', () => {
    it('should return store analytics', async () => {
      const query = { page: 1, limit: 10 };

      const result = await controller.getStoreAnalytics(query as any, mockReq);

      expect(result.success).toBe(true);
      expect(analyticsService.getStoreAnalytics).toHaveBeenCalled();
    });
  });

  describe('getDashboard', () => {
    it('should return dashboard metrics', async () => {
      const result = await controller.getDashboard(mockReq);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ totalOrders: 100 });
    });
  });

  describe('getAllActivities', () => {
    it('should return all activities for admin', async () => {
      const query = { page: 1, limit: 10 };

      const result = await controller.getAllActivities(query as any);

      expect(result.success).toBe(true);
      expect(analyticsService.getUserActivity).toHaveBeenCalledWith('', query);
    });
  });

  describe('trackEvent with mobile user agent', () => {
    it('should detect mobile device', async () => {
      const mobileReq = {
        user: { userId },
        headers: {
          'user-agent':
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) Mobile',
        },
        ip: '192.168.1.1',
      };
      const trackDto = { eventType: 'page_view', eventData: {} };

      await controller.trackEvent(trackDto as any, mobileReq);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        userId,
        trackDto,
        expect.objectContaining({ type: 'mobile' }),
        expect.any(Object),
      );
    });

    it('should detect desktop device', async () => {
      const desktopReq = {
        user: { userId },
        headers: { 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        ip: '192.168.1.1',
      };
      const trackDto = { eventType: 'page_view', eventData: {} };

      await controller.trackEvent(trackDto as any, desktopReq);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        userId,
        trackDto,
        expect.objectContaining({ type: 'desktop' }),
        expect.any(Object),
      );
    });

    it('should handle missing user-agent', async () => {
      const noAgentReq = {
        user: { userId },
        headers: {},
        ip: '192.168.1.1',
      };
      const trackDto = { eventType: 'page_view', eventData: {} };

      await controller.trackEvent(trackDto as any, noAgentReq);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        userId,
        trackDto,
        expect.objectContaining({ userAgent: 'Unknown' }),
        expect.any(Object),
      );
    });

    it('should handle missing ip', async () => {
      const noIpReq = {
        user: { userId },
        headers: { 'user-agent': 'Mozilla/5.0' },
      };
      const trackDto = { eventType: 'page_view', eventData: {} };

      await controller.trackEvent(trackDto as any, noIpReq);

      expect(analyticsService.trackEvent).toHaveBeenCalledWith(
        userId,
        trackDto,
        expect.any(Object),
        expect.objectContaining({ ip: 'Unknown' }),
      );
    });
  });

  describe('getProductAnalytics for admin', () => {
    it('should not filter by store for admin', async () => {
      const adminReq = {
        user: { userId, profileId, role: 'admin' },
        headers: {},
      };
      const query = {} as any;

      await controller.getProductAnalytics(query, adminReq);

      expect(query.storeId).toBeUndefined();
    });
  });

  describe('getStoreAnalytics for store owner', () => {
    it('should filter by store for store owner', async () => {
      const query = {} as any;

      await controller.getStoreAnalytics(query, mockReq);

      expect(query.storeId).toBe(profileId);
    });

    it('should not filter by store for admin', async () => {
      const adminReq = {
        user: { userId, profileId, role: 'admin' },
        headers: {},
      };
      const query = {} as any;

      await controller.getStoreAnalytics(query, adminReq);

      expect(query.storeId).toBeUndefined();
    });
  });
});
