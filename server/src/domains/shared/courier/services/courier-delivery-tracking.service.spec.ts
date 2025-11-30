import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CourierDeliveryTrackingService } from './courier-delivery-tracking.service';
import { CourierProfileService } from './courier-profile.service';
import { PaymentService } from '../../../e-commerce/payment/services/payment.service';
import { CourierProfile } from '../../../../database/schemas/courier-profile.schema';
import { Order } from '../../../../database/schemas/order.schema';
import { Payment } from '../../../../database/schemas/payment.schema';
import {
  MockModelFactory,
  generateObjectId,
  createMockEventEmitter,
} from '../../testing';

describe('CourierDeliveryTrackingService', () => {
  let service: CourierDeliveryTrackingService;
  let courierModel: any;
  let orderModel: any;
  let paymentModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let courierProfileService: jest.Mocked<CourierProfileService>;
  let paymentService: jest.Mocked<PaymentService>;

  const courierId = generateObjectId();
  const accountId = generateObjectId();
  const orderId = generateObjectId();

  const mockCourier = {
    _id: courierId,
    accountId,
    status: 'busy',
    totalDeliveries: 10,
    totalEarnings: 500,
    commissionRate: 10,
    activeDeliveries: [orderId],
    deliveries: [],
    save: jest.fn().mockResolvedValue(this),
  };

  const mockOrder = {
    _id: orderId,
    courierId,
    orderStatus: 'delivering',
    deliveryFee: 100,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    courierModel = MockModelFactory.create([mockCourier]);
    orderModel = MockModelFactory.create([mockOrder]);
    paymentModel = MockModelFactory.create([]);
    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierDeliveryTrackingService,
        { provide: getModelToken(CourierProfile.name), useValue: courierModel },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: getModelToken(Payment.name), useValue: paymentModel },
        { provide: EventEmitter2, useValue: eventEmitter },
        {
          provide: CourierProfileService,
          useValue: {
            getProfileByAccountId: jest.fn().mockResolvedValue(mockCourier),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            confirmCashPaymentByOrderId: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<CourierDeliveryTrackingService>(
      CourierDeliveryTrackingService,
    );
    courierProfileService = module.get(CourierProfileService);
    paymentService = module.get(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateDeliveryStatus', () => {
    it('should update delivery status', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });
      paymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.updateDeliveryStatus(accountId, orderId, {
        status: 'picked_up',
      });

      expect(mockOrder.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'delivery.status.updated',
        expect.any(Object),
      );
    });

    it('should throw NotFoundException if order not found', async () => {
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.updateDeliveryStatus(accountId, orderId, {
          status: 'picked_up',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw UnauthorizedException if order not assigned to courier', async () => {
      const otherCourierId = generateObjectId();
      orderModel.findById.mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...mockOrder, courierId: otherCourierId }),
      });

      await expect(
        service.updateDeliveryStatus(accountId, orderId, {
          status: 'picked_up',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should handle delivered status and update courier profile', async () => {
      const deliveredOrder = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(true),
      };
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deliveredOrder),
      });
      paymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.updateDeliveryStatus(accountId, orderId, {
        status: 'delivered',
      });

      expect(deliveredOrder.orderStatus).toBe('delivered');
      expect(deliveredOrder.actualDeliveryTime).toBeDefined();
      expect(mockCourier.save).toHaveBeenCalled();
    });

    it('should confirm cash payment on delivery', async () => {
      const deliveredOrder = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(true),
      };
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deliveredOrder),
      });
      paymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          paymentMethod: 'cash',
          status: 'pending',
        }),
      });

      await service.updateDeliveryStatus(accountId, orderId, {
        status: 'delivered',
      });

      expect(paymentService.confirmCashPaymentByOrderId).toHaveBeenCalledWith(
        orderId,
        courierId,
      );
    });

    it('should not confirm payment if not cash', async () => {
      const deliveredOrder = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(true),
      };
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deliveredOrder),
      });
      paymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          paymentMethod: 'card',
          status: 'completed',
        }),
      });

      await service.updateDeliveryStatus(accountId, orderId, {
        status: 'delivered',
      });

      expect(paymentService.confirmCashPaymentByOrderId).not.toHaveBeenCalled();
    });

    it('should handle payment confirmation error gracefully', async () => {
      const deliveredOrder = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(true),
      };
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deliveredOrder),
      });
      paymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          paymentMethod: 'cash',
          status: 'pending',
        }),
      });
      paymentService.confirmCashPaymentByOrderId.mockRejectedValue(
        new Error('Payment error'),
      );

      // Should not throw
      await expect(
        service.updateDeliveryStatus(accountId, orderId, {
          status: 'delivered',
        }),
      ).resolves.toBeDefined();
    });

    it('should set courier status to available when no active deliveries', async () => {
      const courierWithOneDelivery = {
        ...mockCourier,
        activeDeliveries: [orderId],
        save: jest.fn().mockResolvedValue(true),
      };
      courierProfileService.getProfileByAccountId.mockResolvedValue(
        courierWithOneDelivery as any,
      );

      const deliveredOrder = {
        ...mockOrder,
        save: jest.fn().mockResolvedValue(true),
      };
      orderModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(deliveredOrder),
      });
      paymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await service.updateDeliveryStatus(accountId, orderId, {
        status: 'delivered',
      });

      expect(courierWithOneDelivery.status).toBe('available');
    });
  });
});
