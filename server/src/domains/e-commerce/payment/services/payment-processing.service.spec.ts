import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentProcessingService } from './payment-processing.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { Order } from '../../../../database/schemas/order.schema';
import {
  PaymentStatusType,
  PaymentMethodType,
} from '../../../../database/schemas/payment.schema';
import {
  generateObjectId,
  createMockEventEmitter,
} from '../../../shared/testing';

describe('PaymentProcessingService', () => {
  let service: PaymentProcessingService;
  let paymentRepository: jest.Mocked<PaymentRepository>;
  let orderModel: any;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const paymentId = generateObjectId();
  const orderId = generateObjectId();
  const customerId = generateObjectId();
  const storeId = generateObjectId();

  const mockOrder = {
    _id: orderId,
    customerId,
    storeId,
    total: 100,
    paymentStatus: 'pending',
    save: jest.fn().mockResolvedValue(true),
  };

  const mockPayment = {
    _id: paymentId,
    orderId,
    customerId,
    storeId,
    amount: 100,
    status: PaymentStatusType.PENDING,
    paymentMethod: PaymentMethodType.CASH,
    refunds: [],
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const mockPaymentModel = {
      findOne: jest.fn().mockReturnValue(mockPayment),
      findById: jest.fn().mockReturnValue(mockPayment),
    };

    paymentRepository = {
      create: jest.fn().mockResolvedValue(mockPayment),
      getModel: jest.fn().mockReturnValue(mockPaymentModel),
    } as any;

    orderModel = {
      findById: jest.fn().mockReturnValue(mockOrder),
    };

    eventEmitter = createMockEventEmitter();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentProcessingService,
        { provide: PaymentRepository, useValue: paymentRepository },
        { provide: getModelToken(Order.name), useValue: orderModel },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    service = module.get<PaymentProcessingService>(PaymentProcessingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create payment for order', async () => {
      paymentRepository.getModel().findOne = jest.fn().mockReturnValue(null);

      const result = await service.createPayment(
        orderId,
        PaymentMethodType.CASH,
      );

      expect(paymentRepository.create).toHaveBeenCalled();
    });

    it('should throw if order not found', async () => {
      orderModel.findById.mockReturnValue(null);

      await expect(
        service.createPayment(orderId, PaymentMethodType.CASH),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if payment already exists', async () => {
      paymentRepository.getModel().findOne = jest
        .fn()
        .mockReturnValue(mockPayment);

      await expect(
        service.createPayment(orderId, PaymentMethodType.CASH),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment', async () => {
      const pendingPayment = {
        ...mockPayment,
        status: PaymentStatusType.PENDING,
        save: jest.fn(),
      };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(pendingPayment);

      await service.confirmPayment(paymentId, 'txn123');

      expect(pendingPayment.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'payment.completed',
        expect.any(Object),
      );
    });

    it('should throw if payment not found', async () => {
      paymentRepository.getModel().findById = jest.fn().mockReturnValue(null);

      await expect(service.confirmPayment(paymentId, 'txn123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if payment already completed', async () => {
      const completedPayment = {
        ...mockPayment,
        status: PaymentStatusType.COMPLETED,
      };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(completedPayment);

      await expect(service.confirmPayment(paymentId, 'txn123')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('failPayment', () => {
    it('should mark payment as failed', async () => {
      const pendingPayment = {
        ...mockPayment,
        status: PaymentStatusType.PENDING,
        save: jest.fn(),
      };
      paymentRepository.getModel().findById = jest
        .fn()
        .mockReturnValue(pendingPayment);

      await service.failPayment(paymentId, 'Insufficient funds');

      expect(pendingPayment.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'payment.failed',
        expect.any(Object),
      );
    });

    it('should throw if payment not found', async () => {
      paymentRepository.getModel().findById = jest.fn().mockReturnValue(null);

      await expect(service.failPayment(paymentId, 'reason')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('confirmCashPaymentByOrderId', () => {
    it('should confirm cash payment', async () => {
      const cashPayment = {
        ...mockPayment,
        paymentMethod: PaymentMethodType.CASH,
        status: PaymentStatusType.PENDING,
        save: jest.fn(),
      };
      paymentRepository.getModel().findOne = jest
        .fn()
        .mockReturnValue(cashPayment);

      await service.confirmCashPaymentByOrderId(orderId, 'courier123');

      expect(cashPayment.save).toHaveBeenCalled();
    });

    it('should throw if not cash payment', async () => {
      const cardPayment = {
        ...mockPayment,
        paymentMethod: PaymentMethodType.CARD,
      };
      paymentRepository.getModel().findOne = jest
        .fn()
        .mockReturnValue(cardPayment);

      await expect(
        service.confirmCashPaymentByOrderId(orderId, 'courier123'),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
