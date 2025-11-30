import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CourierAssignmentService } from './courier-assignment.service';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import { Order } from '../../../../database/schemas/order.schema';
import {
  MockModelFactory,
  generateObjectId,
  createMockEventEmitter,
} from '../../testing';

describe('CourierAssignmentService', () => {
  let service: CourierAssignmentService;
  let courierModel: any;
  let orderModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const courierId = generateObjectId();
  const orderId = generateObjectId();
  const adminId = generateObjectId();

  const mockCourier = {
    _id: courierId,
    status: 'available',
    isAvailableForDelivery: true,
    isCourierSuspended: false,
    verificationStatus: 'approved',
  };

  const mockOrder = {
    _id: orderId,
    orderStatus: 'ready',
    courierId: null,
    deliveryAddress: { location: { coordinates: [36.3, 32.6] } },
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    courierModel = MockModelFactory.create([mockCourier]);
    orderModel = MockModelFactory.create([mockOrder]);
    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierAssignmentService,
        { provide: getModelToken(CourierProfile.name), useValue: courierModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<CourierAssignmentService>(CourierAssignmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('assignOrderToCourier', () => {
    it('should assign order to courier', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });
      courierModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCourier),
      });

      const result = await service.assignOrderToCourier(
        orderId,
        courierId,
        adminId,
      );

      expect(mockOrder.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'order.assigned.to.courier',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.assignOrderToCourier(orderId, courierId, adminId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if courier is suspended', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });
      courierModel.findById.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockCourier, isCourierSuspended: true }),
      });

      await expect(
        service.assignOrderToCourier(orderId, courierId, adminId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAvailableCouriersForOrder', () => {
    it('should find available couriers for order', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });
      courierModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockCourier]),
      });

      const result = await service.findAvailableCouriersForOrder(orderId);

      expect(result).toEqual([mockCourier]);
    });

    it('should throw NotFoundException if order not found', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findAvailableCouriersForOrder(orderId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
