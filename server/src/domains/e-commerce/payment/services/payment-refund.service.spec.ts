import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentRefundService } from './payment-refund.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { Order } from '../../../../database/schemas/order.schema';
import { PaymentStatusType } from '../../../../database/schemas/payment.schema';
import {
  generateObjectId,
  createMockEventEmitter,
} from '../../../shared/testing';

describe('PaymentRefundService', () => {
  let service: PaymentRefundService;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let orderModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const paymentId = generateObjectId();
  const orderId = generateObjectId();
  const customerId = generateObjectId();
  const storeId = generateObjectId();
  const refundedBy = generateObjectId();

  const mockOrder = {
    _id: orderId,
    customerId,
    storeId,
    paymentStatus: 'paid',
    save: jest.fn().mockResolvedValue(true),
  };

  const mockPayment = {
    _id: paymentId,
    orderId,
    customerId,
    storeId,
    amount: 100,
    status: PaymentStatusType.COMPLETED,
    refunds: [],
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const mockPaymentModel = {
      findById: jest.fn().mockReturnValue({ ...mockPayment, refunds: [] }),
    };

    paymentRepository = {
      getModel: jest.fn().mockReturnValue(mockPaymentModel),
    } as any;

    orderModel = {
      findById: jest.fn().mockReturnValue(mockOrder),
    };

    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRefundService,
        { provide: PaymentRepository, useValue: paymentRepository },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PaymentRefundService>(PaymentRefundService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refundPayment', () => {
    it('should process full refund', async () => {
      const payment = { ...mockPayment, refunds: [], save: jest.fn() };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(payment);

      await service.refundPayment(
        paymentId,
        { amount: 100, reason: 'Customer request' },
        refundedBy,
      );

      expect(payment.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'payment.refunded',
        expect.any(Object),
      );
    });

    it('should process partial refund', async () => {
      const payment = { ...mockPayment, refunds: [], save: jest.fn() };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(payment);

      await service.refundPayment(
        paymentId,
        { amount: 50, reason: 'Partial refund' },
        refundedBy,
      );

      expect(payment.status).toBe(PaymentStatusType.PARTIALLY_REFUNDED);
    });

    it('should throw if payment not found', async () => {
      paymentRepository.getModel().findById = jest.fn().mockReturnValue(null);

      await expect(
        service.refundPayment(
          paymentId,
          { amount: 50, reason: 'test' },
          refundedBy,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if payment not completed', async () => {
      const pendingPayment = {
        ...mockPayment,
        status: PaymentStatusType.PENDING,
      };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(pendingPayment);

      await expect(
        service.refundPayment(
          paymentId,
          { amount: 50, reason: 'test' },
          refundedBy,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if refund exceeds payment amount', async () => {
      const payment = { ...mockPayment, refunds: [{ amount: 80 }] };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(payment);

      await expect(
        service.refundPayment(
          paymentId,
          { amount: 50, reason: 'test' },
          refundedBy,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getRefundHistory', () => {
    it('should return refund history', async () => {
      const refunds = [{ amount: 50, reason: 'test' }];
      const payment = { ...mockPayment, refunds };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(payment);

      const result = await service.getRefundHistory(paymentId);

      expect(result).toEqual(refunds);
    });

    it('should throw if payment not found', async () => {
      paymentRepository.getModel().findById = jest.fn().mockReturnValue(null);

      await expect(service.getRefundHistory(paymentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTotalRefunded', () => {
    it('should calculate total refunded', async () => {
      const payment = {
        ...mockPayment,
        refunds: [{ amount: 30 }, { amount: 20 }],
      };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(payment);

      const result = await service.getTotalRefunded(paymentId);

      expect(result).toBe(50);
    });
  });
});
