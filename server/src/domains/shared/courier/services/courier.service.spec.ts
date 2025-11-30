import { Test, TestingModule } from '@nestjs/testing';
import { CourierService } from './courier.service';
import { CourierProfileService } from './courier-profile.service';
import { CourierDeliveryService } from './courier-delivery.service';
import { CourierEarningsService } from './courier-earnings.service';
import { generateObjectId } from '../../testing';

describe('CourierService', () => {
  let service: CourierService;

  const mockProfileService = {
    getProfileByAccountId: jest.fn(),
    getProfileById: jest.fn(),
    updateProfile: jest.fn(),
    updateStatus: jest.fn(),
    updateLocation: jest.fn(),
    findAvailableCouriers: jest.fn(),
  };

  const mockDeliveryService = {
    getActiveDeliveries: jest.fn(),
    getDeliveryHistory: jest.fn(),
    acceptOrder: jest.fn(),
    rejectOrder: jest.fn(),
    updateDeliveryStatus: jest.fn(),
  };

  const mockEarningsService = {
    getEarningsSummary: jest.fn(),
  };

  const accountId = generateObjectId();
  const courierId = generateObjectId();
  const orderId = generateObjectId();

  const mockCourier = {
    _id: courierId,
    accountId,
    status: 'online',
    currentLocation: { type: 'Point', coordinates: [36.3, 33.5] },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierService,
        { provide: CourierProfileService, useValue: mockProfileService },
        { provide: CourierDeliveryService, useValue: mockDeliveryService },
        { provide: CourierEarningsService, useValue: mockEarningsService },
      ],
    }).compile();

    service = module.get<CourierService>(CourierService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfileByAccountId', () => {
    it('should delegate to profile service', async () => {
      mockProfileService.getProfileByAccountId.mockResolvedValue(mockCourier);

      const result = await service.getProfileByAccountId(accountId);

      expect(result).toEqual(mockCourier);
    });
  });

  describe('updateStatus', () => {
    it('should delegate to profile service', async () => {
      mockProfileService.updateStatus.mockResolvedValue({
        ...mockCourier,
        status: 'offline',
      });

      const result = await service.updateStatus(accountId, {
        status: 'offline',
      } as any);

      expect(result.status).toBe('offline');
    });
  });

  describe('updateLocation', () => {
    it('should delegate to profile service', async () => {
      mockProfileService.updateLocation.mockResolvedValue(mockCourier);

      const result = await service.updateLocation(accountId, {
        longitude: 36.3,
        latitude: 33.5,
      } as any);

      expect(result).toEqual(mockCourier);
    });
  });

  describe('getActiveDeliveries', () => {
    it('should delegate to delivery service', async () => {
      mockDeliveryService.getActiveDeliveries.mockResolvedValue([
        { _id: orderId },
      ]);

      const result = await service.getActiveDeliveries(accountId);

      expect(result).toHaveLength(1);
    });
  });

  describe('acceptOrder', () => {
    it('should delegate to delivery service', async () => {
      mockDeliveryService.acceptOrder.mockResolvedValue({
        _id: orderId,
        status: 'accepted',
      });

      const result = await service.acceptOrder(accountId, orderId);

      expect(result.status).toBe('accepted');
    });
  });

  describe('rejectOrder', () => {
    it('should delegate to delivery service', async () => {
      mockDeliveryService.rejectOrder.mockResolvedValue(undefined);

      await service.rejectOrder(accountId, orderId, 'Too far');

      expect(mockDeliveryService.rejectOrder).toHaveBeenCalledWith(
        accountId,
        orderId,
        'Too far',
      );
    });
  });

  describe('getEarningsSummary', () => {
    it('should delegate to earnings service', async () => {
      mockEarningsService.getEarningsSummary.mockResolvedValue({
        totalEarnings: 50000,
      });

      const result = await service.getEarningsSummary(accountId);

      expect(result.totalEarnings).toBe(50000);
    });
  });

  describe('findAvailableCouriers', () => {
    it('should delegate to profile service', async () => {
      mockProfileService.findAvailableCouriers.mockResolvedValue([mockCourier]);

      const result = await service.findAvailableCouriers(36.3, 33.5);

      expect(result).toHaveLength(1);
    });

    it('should use custom maxDistance', async () => {
      mockProfileService.findAvailableCouriers.mockResolvedValue([mockCourier]);

      const result = await service.findAvailableCouriers(36.3, 33.5, 5000);

      expect(mockProfileService.findAvailableCouriers).toHaveBeenCalledWith(
        36.3,
        33.5,
        5000,
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('getProfileById', () => {
    it('should delegate to profile service', async () => {
      mockProfileService.getProfileById.mockResolvedValue(mockCourier);

      const result = await service.getProfileById(courierId);

      expect(result).toEqual(mockCourier);
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(courierId);
    });
  });

  describe('updateProfile', () => {
    it('should delegate to profile service', async () => {
      const updateDto = { vehicleType: 'motorcycle' };
      mockProfileService.updateProfile.mockResolvedValue({
        ...mockCourier,
        vehicleType: 'motorcycle',
      });

      const result = await service.updateProfile(accountId, updateDto as any);

      expect(result.vehicleType).toBe('motorcycle');
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        accountId,
        updateDto,
      );
    });
  });

  describe('getDeliveryHistory', () => {
    it('should delegate to delivery service with default limit', async () => {
      mockDeliveryService.getDeliveryHistory.mockResolvedValue([
        { _id: orderId },
      ]);

      const result = await service.getDeliveryHistory(accountId);

      expect(result).toHaveLength(1);
      expect(mockDeliveryService.getDeliveryHistory).toHaveBeenCalledWith(
        accountId,
        50,
      );
    });

    it('should delegate to delivery service with custom limit', async () => {
      mockDeliveryService.getDeliveryHistory.mockResolvedValue([
        { _id: orderId },
      ]);

      const result = await service.getDeliveryHistory(accountId, 100);

      expect(result).toHaveLength(1);
      expect(mockDeliveryService.getDeliveryHistory).toHaveBeenCalledWith(
        accountId,
        100,
      );
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should delegate to delivery service', async () => {
      const updateDto = { status: 'delivered' };
      mockDeliveryService.updateDeliveryStatus.mockResolvedValue({
        _id: orderId,
        status: 'delivered',
      });

      const result = await service.updateDeliveryStatus(
        accountId,
        orderId,
        updateDto as any,
      );

      expect(result.status).toBe('delivered');
      expect(mockDeliveryService.updateDeliveryStatus).toHaveBeenCalledWith(
        accountId,
        orderId,
        updateDto,
      );
    });
  });

  describe('acceptOrder with notes', () => {
    it('should pass notes to delivery service', async () => {
      mockDeliveryService.acceptOrder.mockResolvedValue({
        _id: orderId,
        status: 'accepted',
      });

      const result = await service.acceptOrder(
        accountId,
        orderId,
        'Will arrive in 10 minutes',
      );

      expect(result.status).toBe('accepted');
      expect(mockDeliveryService.acceptOrder).toHaveBeenCalledWith(
        accountId,
        orderId,
        'Will arrive in 10 minutes',
      );
    });
  });
});
