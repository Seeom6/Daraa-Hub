import { Test, TestingModule } from '@nestjs/testing';
import { CourierAdminService } from './courier-admin.service';
import { CourierAssignmentService } from './courier-assignment.service';
import { CourierSuspensionService } from './courier-suspension.service';
import { CourierStatsService } from './courier-stats.service';
import { generateObjectId } from '../../testing';

describe('CourierAdminService', () => {
  let service: CourierAdminService;
  let assignmentService: jest.Mocked<CourierAssignmentService>;
  let suspensionService: jest.Mocked<CourierSuspensionService>;
  let statsService: jest.Mocked<CourierStatsService>;

  const courierId = generateObjectId();
  const orderId = generateObjectId();
  const adminId = generateObjectId();

  const mockCourier = { _id: courierId, status: 'available' };
  const mockOrder = { _id: orderId, courierId };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierAdminService,
        {
          provide: CourierAssignmentService,
          useValue: {
            assignOrderToCourier: jest.fn().mockResolvedValue(mockOrder),
            findAvailableCouriersForOrder: jest
              .fn()
              .mockResolvedValue([mockCourier]),
          },
        },
        {
          provide: CourierSuspensionService,
          useValue: {
            suspendCourier: jest.fn().mockResolvedValue(mockCourier),
            unsuspendCourier: jest.fn().mockResolvedValue(mockCourier),
            updateCommissionRate: jest.fn().mockResolvedValue(mockCourier),
          },
        },
        {
          provide: CourierStatsService,
          useValue: {
            getAllCouriers: jest.fn().mockResolvedValue([mockCourier]),
            getCourierStatistics: jest
              .fn()
              .mockResolvedValue({ totalDeliveries: 100 }),
          },
        },
      ],
    }).compile();

    service = module.get<CourierAdminService>(CourierAdminService);
    assignmentService = module.get(CourierAssignmentService);
    suspensionService = module.get(CourierSuspensionService);
    statsService = module.get(CourierStatsService);
  });

  describe('getAllCouriers', () => {
    it('should delegate to stats service', async () => {
      const result = await service.getAllCouriers({ status: 'available' });

      expect(statsService.getAllCouriers).toHaveBeenCalledWith({
        status: 'available',
      });
      expect(result).toEqual([mockCourier]);
    });
  });

  describe('getCourierStatistics', () => {
    it('should delegate to stats service', async () => {
      const result = await service.getCourierStatistics(courierId);

      expect(statsService.getCourierStatistics).toHaveBeenCalledWith(courierId);
      expect(result).toEqual({ totalDeliveries: 100 });
    });
  });

  describe('assignOrderToCourier', () => {
    it('should delegate to assignment service', async () => {
      const result = await service.assignOrderToCourier(
        orderId,
        courierId,
        adminId,
      );

      expect(assignmentService.assignOrderToCourier).toHaveBeenCalledWith(
        orderId,
        courierId,
        adminId,
      );
      expect(result).toEqual(mockOrder);
    });
  });

  describe('findAvailableCouriersForOrder', () => {
    it('should delegate to assignment service', async () => {
      const result = await service.findAvailableCouriersForOrder(orderId);

      expect(
        assignmentService.findAvailableCouriersForOrder,
      ).toHaveBeenCalledWith(orderId);
      expect(result).toEqual([mockCourier]);
    });
  });

  describe('suspendCourier', () => {
    it('should delegate to suspension service', async () => {
      const result = await service.suspendCourier(
        courierId,
        adminId,
        'Violation',
      );

      expect(suspensionService.suspendCourier).toHaveBeenCalledWith(
        courierId,
        adminId,
        'Violation',
      );
      expect(result).toEqual(mockCourier);
    });
  });

  describe('unsuspendCourier', () => {
    it('should delegate to suspension service', async () => {
      const result = await service.unsuspendCourier(courierId);

      expect(suspensionService.unsuspendCourier).toHaveBeenCalledWith(
        courierId,
      );
      expect(result).toEqual(mockCourier);
    });
  });

  describe('updateCommissionRate', () => {
    it('should delegate to suspension service', async () => {
      const result = await service.updateCommissionRate(courierId, 15);

      expect(suspensionService.updateCommissionRate).toHaveBeenCalledWith(
        courierId,
        15,
      );
      expect(result).toEqual(mockCourier);
    });
  });
});
