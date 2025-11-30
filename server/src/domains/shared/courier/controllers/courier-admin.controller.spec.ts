import { Test, TestingModule } from '@nestjs/testing';
import { CourierAdminController } from './courier-admin.controller';
import { CourierService } from '../services/courier.service';
import { CourierAdminService } from '../services/courier-admin.service';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { generateObjectId } from '../../testing';

describe('CourierAdminController', () => {
  let controller: CourierAdminController;

  const mockCourierService = {
    getProfileById: jest.fn(),
  };

  const mockAdminService = {
    getAllCouriers: jest.fn(),
    assignOrderToCourier: jest.fn(),
    findAvailableCouriersForOrder: jest.fn(),
    suspendCourier: jest.fn(),
    unsuspendCourier: jest.fn(),
    updateCommissionRate: jest.fn(),
    getCourierStatistics: jest.fn(),
  };

  const adminId = generateObjectId();
  const courierId = generateObjectId();
  const orderId = generateObjectId();

  const mockUser = { sub: adminId };

  const mockCourier = {
    _id: courierId,
    status: 'available',
    isCourierSuspended: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourierAdminController],
      providers: [
        { provide: CourierService, useValue: mockCourierService },
        { provide: CourierAdminService, useValue: mockAdminService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CourierAdminController>(CourierAdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCouriers', () => {
    it('should return all couriers', async () => {
      mockAdminService.getAllCouriers.mockResolvedValue([mockCourier]);

      const result = await controller.getAllCouriers();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCourier]);
    });
  });

  describe('getCourierById', () => {
    it('should return courier by id', async () => {
      mockCourierService.getProfileById.mockResolvedValue(mockCourier);

      const result = await controller.getCourierById(courierId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourier);
    });
  });

  describe('assignOrder', () => {
    it('should assign order to courier', async () => {
      mockAdminService.assignOrderToCourier.mockResolvedValue({ _id: orderId });

      const result = await controller.assignOrder(mockUser, {
        orderId,
        courierId,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('findAvailableCouriersForOrder', () => {
    it('should find available couriers', async () => {
      mockAdminService.findAvailableCouriersForOrder.mockResolvedValue([
        mockCourier,
      ]);

      const result = await controller.findAvailableCouriersForOrder(orderId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockCourier]);
    });
  });

  describe('suspendCourier', () => {
    it('should suspend courier', async () => {
      mockAdminService.suspendCourier.mockResolvedValue({
        ...mockCourier,
        isCourierSuspended: true,
      });

      const result = await controller.suspendCourier(mockUser, courierId, {
        reason: 'Violation',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('unsuspendCourier', () => {
    it('should unsuspend courier', async () => {
      mockAdminService.unsuspendCourier.mockResolvedValue(mockCourier);

      const result = await controller.unsuspendCourier(courierId);

      expect(result.success).toBe(true);
    });
  });

  describe('updateCommissionRate', () => {
    it('should update commission rate', async () => {
      mockAdminService.updateCommissionRate.mockResolvedValue({
        ...mockCourier,
        commissionRate: 20,
      });

      const result = await controller.updateCommissionRate(courierId, {
        commissionRate: 20,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getCourierStatistics', () => {
    it('should return courier statistics', async () => {
      mockAdminService.getCourierStatistics.mockResolvedValue({
        totalDeliveries: 100,
      });

      const result = await controller.getCourierStatistics(courierId);

      expect(result.success).toBe(true);
      expect(result.data.totalDeliveries).toBe(100);
    });
  });
});
