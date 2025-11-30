import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CourierDeliveryAssignmentService } from './courier-delivery-assignment.service';
import { CourierProfileService } from './courier-profile.service';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import { Order } from '../../../../database/schemas/order.schema';
import {
  MockModelFactory,
  generateObjectId,
  createMockEventEmitter,
} from '../../testing';

describe('CourierDeliveryAssignmentService', () => {
  let service: CourierDeliveryAssignmentService;
  let courierModel: any;
  let orderModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let courierProfileService: jest.Mocked<CourierProfileService>;

  const courierId = generateObjectId();
  const accountId = generateObjectId();
  const orderId = generateObjectId();

  const mockCourier = {
    _id: courierId,
    accountId,
    status: 'available',
    activeDeliveries: [],
    save: jest.fn().mockResolvedValue(this),
  };

  const mockOrder = {
    _id: orderId,
    courierId,
    orderStatus: 'ready',
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    courierModel = MockModelFactory.create([mockCourier]);
    orderModel = MockModelFactory.create([mockOrder]);
    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierDeliveryAssignmentService,
        { provide: getModelToken(CourierProfile.name), useValue: courierModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: EventEmitter2, useValue: eventEmitter },
        {
          provide: CourierProfileService,
          useValue: {
            getProfileByAccountId: jest.fn().mockResolvedValue(mockCourier),
          },
        },
      ],
    }).compile();

    service = module.get<CourierDeliveryAssignmentService>(
      CourierDeliveryAssignmentService,
    );
    courierProfileService = module.get(CourierProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('acceptOrder', () => {
    it('should accept order', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.acceptOrder(accountId, orderId, 'On my way');

      expect(mockCourier.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'courier.order.accepted',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.acceptOrder(accountId, orderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if order not assigned to courier', async () => {
      const otherCourierId = generateObjectId();
      orderModel.findById.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockOrder, courierId: otherCourierId }),
      });

      await expect(service.acceptOrder(accountId, orderId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('rejectOrder', () => {
    it('should reject order', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      await service.rejectOrder(accountId, orderId, 'Too far');

      expect(mockOrder.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'courier.order.rejected',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.rejectOrder(accountId, orderId, 'Too far'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
