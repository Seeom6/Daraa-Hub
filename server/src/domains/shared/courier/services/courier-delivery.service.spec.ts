import { Test, TestingModule } from '@nestjs/testing';
import { CourierDeliveryService } from './courier-delivery.service';
import { CourierDeliveryAssignmentService } from './courier-delivery-assignment.service';
import { CourierDeliveryTrackingService } from './courier-delivery-tracking.service';
import { CourierDeliveryQueryService } from './courier-delivery-query.service';
import { generateObjectId } from '../../testing';

describe('CourierDeliveryService', () => {
  let service: CourierDeliveryService;

  const mockAssignmentService = {
    acceptOrder: jest.fn(),
    rejectOrder: jest.fn(),
  };

  const mockTrackingService = {
    updateDeliveryStatus: jest.fn(),
  };

  const mockQueryService = {
    getActiveDeliveries: jest.fn(),
    getDeliveryHistory: jest.fn(),
  };

  const accountId = generateObjectId();
  const orderId = generateObjectId();

  const mockOrder = {
    _id: orderId,
    orderStatus: 'out_for_delivery',
    courierId: generateObjectId(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierDeliveryService,
        {
          provide: CourierDeliveryAssignmentService,
          useValue: mockAssignmentService,
        },
        {
          provide: CourierDeliveryTrackingService,
          useValue: mockTrackingService,
        },
        { provide: CourierDeliveryQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<CourierDeliveryService>(CourierDeliveryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveDeliveries', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getActiveDeliveries.mockResolvedValue([mockOrder]);

      const result = await service.getActiveDeliveries(accountId);

      expect(result).toEqual([mockOrder]);
      expect(mockQueryService.getActiveDeliveries).toHaveBeenCalledWith(
        accountId,
      );
    });
  });

  describe('getDeliveryHistory', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getDeliveryHistory.mockResolvedValue([mockOrder]);

      const result = await service.getDeliveryHistory(accountId, 50);

      expect(result).toEqual([mockOrder]);
      expect(mockQueryService.getDeliveryHistory).toHaveBeenCalledWith(
        accountId,
        50,
      );
    });
  });

  describe('acceptOrder', () => {
    it('should delegate to assignment service', async () => {
      mockAssignmentService.acceptOrder.mockResolvedValue(mockOrder);

      const result = await service.acceptOrder(accountId, orderId, 'notes');

      expect(result).toEqual(mockOrder);
      expect(mockAssignmentService.acceptOrder).toHaveBeenCalledWith(
        accountId,
        orderId,
        'notes',
      );
    });
  });

  describe('rejectOrder', () => {
    it('should delegate to assignment service', async () => {
      mockAssignmentService.rejectOrder.mockResolvedValue(undefined);

      await service.rejectOrder(accountId, orderId, 'Too far');

      expect(mockAssignmentService.rejectOrder).toHaveBeenCalledWith(
        accountId,
        orderId,
        'Too far',
      );
    });
  });

  describe('updateDeliveryStatus', () => {
    it('should delegate to tracking service', async () => {
      mockTrackingService.updateDeliveryStatus.mockResolvedValue(mockOrder);

      const result = await service.updateDeliveryStatus(accountId, orderId, {
        status: 'delivered',
      } as any);

      expect(result).toEqual(mockOrder);
    });
  });

  describe('getDeliveryHistory with default limit', () => {
    it('should use default limit of 50', async () => {
      mockQueryService.getDeliveryHistory.mockResolvedValue([mockOrder]);

      await service.getDeliveryHistory(accountId);

      expect(mockQueryService.getDeliveryHistory).toHaveBeenCalledWith(
        accountId,
        50,
      );
    });
  });

  describe('acceptOrder without notes', () => {
    it('should accept order without notes', async () => {
      mockAssignmentService.acceptOrder.mockResolvedValue(mockOrder);

      const result = await service.acceptOrder(accountId, orderId);

      expect(result).toEqual(mockOrder);
      expect(mockAssignmentService.acceptOrder).toHaveBeenCalledWith(
        accountId,
        orderId,
        undefined,
      );
    });
  });
});
