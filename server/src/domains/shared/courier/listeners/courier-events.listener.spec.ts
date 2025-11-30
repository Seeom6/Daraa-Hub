import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CourierEventsListener } from './courier-events.listener';
import { PaymentService } from '../../../e-commerce/payment/services/payment.service';
import { Order } from '../../../../database/schemas/order.schema';
import {
  Payment,
  PaymentMethodType,
} from '../../../../database/schemas/payment.schema';
import { Types } from 'mongoose';

describe('CourierEventsListener', () => {
  let listener: CourierEventsListener;
  let paymentService: jest.Mocked<PaymentService>;
  let paymentModel: any;

  const mockPaymentModel = {
    findOne: jest.fn(),
  };

  const mockOrderModel = {};

  const mockPaymentService = {
    confirmCashPaymentByOrderId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierEventsListener,
        { provide: getModelToken(Order.name), useValue: mockOrderModel },
        { provide: getModelToken(Payment.name), useValue: mockPaymentModel },
        { provide: PaymentService, useValue: mockPaymentService },
      ],
    }).compile();

    listener = module.get<CourierEventsListener>(CourierEventsListener);
    paymentService = module.get(PaymentService);
    paymentModel = module.get(getModelToken(Payment.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleDeliveryStatusUpdate', () => {
    const orderId = new Types.ObjectId().toString();
    const courierId = new Types.ObjectId().toString();

    it('should confirm cash payment when order is delivered with cash payment', async () => {
      const mockPayment = {
        orderId,
        paymentMethod: PaymentMethodType.CASH,
      };
      mockPaymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPayment),
      });
      mockPaymentService.confirmCashPaymentByOrderId.mockResolvedValue(
        undefined,
      );

      await listener.handleDeliveryStatusUpdate({
        courierId,
        orderId,
        status: 'delivered',
      });

      expect(mockPaymentModel.findOne).toHaveBeenCalledWith({ orderId });
      expect(paymentService.confirmCashPaymentByOrderId).toHaveBeenCalledWith(
        orderId,
        courierId,
      );
    });

    it('should not confirm payment when status is not delivered', async () => {
      await listener.handleDeliveryStatusUpdate({
        courierId,
        orderId,
        status: 'in_transit',
      });

      expect(mockPaymentModel.findOne).not.toHaveBeenCalled();
      expect(paymentService.confirmCashPaymentByOrderId).not.toHaveBeenCalled();
    });

    it('should not confirm payment when payment method is not cash', async () => {
      const mockPayment = {
        orderId,
        paymentMethod: PaymentMethodType.CARD,
      };
      mockPaymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPayment),
      });

      await listener.handleDeliveryStatusUpdate({
        courierId,
        orderId,
        status: 'delivered',
      });

      expect(paymentService.confirmCashPaymentByOrderId).not.toHaveBeenCalled();
    });

    it('should handle error when confirming cash payment fails', async () => {
      const mockPayment = {
        orderId,
        paymentMethod: PaymentMethodType.CASH,
      };
      mockPaymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPayment),
      });
      mockPaymentService.confirmCashPaymentByOrderId.mockRejectedValue(
        new Error('Payment confirmation failed'),
      );

      // Should not throw, just log error
      await expect(
        listener.handleDeliveryStatusUpdate({
          courierId,
          orderId,
          status: 'delivered',
        }),
      ).resolves.not.toThrow();
    });

    it('should handle when no payment is found', async () => {
      mockPaymentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await listener.handleDeliveryStatusUpdate({
        courierId,
        orderId,
        status: 'delivered',
      });

      expect(paymentService.confirmCashPaymentByOrderId).not.toHaveBeenCalled();
    });
  });

  describe('handleOrderAssigned', () => {
    it('should log order assignment', async () => {
      const payload = {
        orderId: new Types.ObjectId().toString(),
        courierId: new Types.ObjectId().toString(),
        assignedBy: new Types.ObjectId().toString(),
      };

      await expect(
        listener.handleOrderAssigned(payload),
      ).resolves.not.toThrow();
    });
  });

  describe('handleOrderAccepted', () => {
    it('should log order acceptance', async () => {
      const payload = {
        courierId: new Types.ObjectId().toString(),
        orderId: new Types.ObjectId().toString(),
        notes: 'Will pick up soon',
      };

      await expect(
        listener.handleOrderAccepted(payload),
      ).resolves.not.toThrow();
    });
  });

  describe('handleOrderRejected', () => {
    it('should log order rejection', async () => {
      const payload = {
        courierId: new Types.ObjectId().toString(),
        orderId: new Types.ObjectId().toString(),
        reason: 'Too far',
      };

      await expect(
        listener.handleOrderRejected(payload),
      ).resolves.not.toThrow();
    });
  });

  describe('handleCourierSuspended', () => {
    it('should log courier suspension', async () => {
      const payload = {
        courierId: new Types.ObjectId().toString(),
        suspendedBy: new Types.ObjectId().toString(),
        reason: 'Policy violation',
      };

      await expect(
        listener.handleCourierSuspended(payload),
      ).resolves.not.toThrow();
    });
  });

  describe('handleCourierUnsuspended', () => {
    it('should log courier unsuspension', async () => {
      const payload = {
        courierId: new Types.ObjectId().toString(),
      };

      await expect(
        listener.handleCourierUnsuspended(payload),
      ).resolves.not.toThrow();
    });
  });
});
