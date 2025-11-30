import { Test, TestingModule } from '@nestjs/testing';
import { CourierController } from './courier.controller';
import { CourierService } from '../services/courier.service';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { generateObjectId } from '../../testing';

describe('CourierController', () => {
  let controller: CourierController;

  const mockCourierService = {
    getProfileByAccountId: jest.fn(),
    updateProfile: jest.fn(),
    updateStatus: jest.fn(),
    updateLocation: jest.fn(),
    getActiveDeliveries: jest.fn(),
    getDeliveryHistory: jest.fn(),
    getEarningsSummary: jest.fn(),
    acceptOrder: jest.fn(),
    rejectOrder: jest.fn(),
    updateDeliveryStatus: jest.fn(),
  };

  const accountId = generateObjectId();
  const orderId = generateObjectId();

  const mockUser = { sub: accountId };

  const mockProfile = {
    _id: generateObjectId(),
    accountId,
    status: 'available',
    currentLocation: { type: 'Point', coordinates: [36.2, 33.5] },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourierController],
      providers: [{ provide: CourierService, useValue: mockCourierService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CourierController>(CourierController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return courier profile', async () => {
      mockCourierService.getProfileByAccountId.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update profile', async () => {
      mockCourierService.updateProfile.mockResolvedValue(mockProfile);

      const result = await controller.updateProfile(mockUser, {
        vehicleType: 'motorcycle',
      } as any);

      expect(result.success).toBe(true);
    });
  });

  describe('updateStatus', () => {
    it('should update status', async () => {
      mockCourierService.updateStatus.mockResolvedValue({
        ...mockProfile,
        status: 'busy',
      });

      const result = await controller.updateStatus(mockUser, {
        status: 'busy',
      } as any);

      expect(result.success).toBe(true);
    });
  });

  describe('updateLocation', () => {
    it('should update location', async () => {
      mockCourierService.updateLocation.mockResolvedValue(mockProfile);

      const result = await controller.updateLocation(mockUser, {
        coordinates: [36.3, 33.6],
      } as any);

      expect(result.success).toBe(true);
    });
  });

  describe('getActiveDeliveries', () => {
    it('should return active deliveries', async () => {
      mockCourierService.getActiveDeliveries.mockResolvedValue([]);

      const result = await controller.getActiveDeliveries(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getDeliveryHistory', () => {
    it('should return delivery history with limit', async () => {
      mockCourierService.getDeliveryHistory.mockResolvedValue([]);

      const result = await controller.getDeliveryHistory(mockUser, '50');

      expect(result.success).toBe(true);
      expect(mockCourierService.getDeliveryHistory).toHaveBeenCalledWith(
        accountId,
        50,
      );
    });

    it('should use default limit when not provided', async () => {
      mockCourierService.getDeliveryHistory.mockResolvedValue([]);

      const result = await controller.getDeliveryHistory(mockUser);

      expect(result.success).toBe(true);
      expect(mockCourierService.getDeliveryHistory).toHaveBeenCalledWith(
        accountId,
        50,
      );
    });

    it('should use default limit when undefined', async () => {
      mockCourierService.getDeliveryHistory.mockResolvedValue([]);

      const result = await controller.getDeliveryHistory(mockUser, undefined);

      expect(result.success).toBe(true);
      expect(mockCourierService.getDeliveryHistory).toHaveBeenCalledWith(
        accountId,
        50,
      );
    });
  });

  describe('getEarnings', () => {
    it('should return earnings summary', async () => {
      mockCourierService.getEarningsSummary.mockResolvedValue({
        totalEarnings: 5000,
      });

      const result = await controller.getEarnings(mockUser);

      expect(result.success).toBe(true);
      expect(result.data.totalEarnings).toBe(5000);
    });
  });

  describe('acceptOrder', () => {
    it('should accept order', async () => {
      mockCourierService.acceptOrder.mockResolvedValue({ _id: orderId });

      const result = await controller.acceptOrder(mockUser, orderId, {
        notes: 'On my way',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('rejectOrder', () => {
    it('should reject order', async () => {
      mockCourierService.rejectOrder.mockResolvedValue(undefined);

      const result = await controller.rejectOrder(mockUser, orderId, {
        reason: 'Too far',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status', async () => {
      mockCourierService.updateDeliveryStatus.mockResolvedValue({
        _id: orderId,
      });

      const result = await controller.updateDeliveryStatus(mockUser, orderId, {
        status: 'delivered',
      } as any);

      expect(result.success).toBe(true);
    });
  });
});
