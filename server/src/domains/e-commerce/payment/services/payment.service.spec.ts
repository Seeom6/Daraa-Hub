import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PaymentProcessingService } from './payment-processing.service';
import { PaymentRefundService } from './payment-refund.service';
import { PaymentQueryService } from './payment-query.service';
import { generateObjectId } from '../../../shared/testing';

describe('PaymentService', () => {
  let service: PaymentService;

  const mockProcessingService = {
    createPayment: jest.fn(),
    processPayment: jest.fn(),
    confirmPayment: jest.fn(),
    confirmCashPaymentByOrderId: jest.fn(),
    failPayment: jest.fn(),
  };

  const mockRefundService = {
    refundPayment: jest.fn(),
  };

  const mockQueryService = {
    getPaymentByOrderId: jest.fn(),
    getPaymentById: jest.fn(),
    getAllPayments: jest.fn(),
    getCustomerPayments: jest.fn(),
    getStorePayments: jest.fn(),
  };

  const paymentId = generateObjectId();
  const orderId = generateObjectId();
  const customerId = generateObjectId();
  const storeId = generateObjectId();

  const mockPayment = {
    _id: paymentId,
    orderId,
    amount: 5000,
    status: 'pending',
    paymentMethod: 'cash_on_delivery',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PaymentProcessingService, useValue: mockProcessingService },
        { provide: PaymentRefundService, useValue: mockRefundService },
        { provide: PaymentQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should delegate to processing service', async () => {
      mockProcessingService.createPayment.mockResolvedValue(mockPayment);

      const result = await service.createPayment(
        orderId,
        'cash_on_delivery' as any,
      );

      expect(result).toEqual(mockPayment);
    });
  });

  describe('processPayment', () => {
    it('should delegate to processing service', async () => {
      mockProcessingService.processPayment.mockResolvedValue({
        ...mockPayment,
        status: 'completed',
      });

      const result = await service.processPayment(
        { paymentId } as any,
        customerId,
      );

      expect(result.status).toBe('completed');
    });
  });

  describe('confirmPayment', () => {
    it('should delegate to processing service', async () => {
      mockProcessingService.confirmPayment.mockResolvedValue({
        ...mockPayment,
        status: 'completed',
      });

      const result = await service.confirmPayment(paymentId, 'txn-123');

      expect(result.status).toBe('completed');
    });
  });

  describe('confirmCashPaymentByOrderId', () => {
    it('should delegate to processing service', async () => {
      mockProcessingService.confirmCashPaymentByOrderId.mockResolvedValue({
        ...mockPayment,
        status: 'completed',
      });

      const result = await service.confirmCashPaymentByOrderId(
        orderId,
        customerId,
      );

      expect(result.status).toBe('completed');
    });
  });

  describe('failPayment', () => {
    it('should delegate to processing service', async () => {
      mockProcessingService.failPayment.mockResolvedValue({
        ...mockPayment,
        status: 'failed',
      });

      const result = await service.failPayment(paymentId, 'Insufficient funds');

      expect(result.status).toBe('failed');
    });
  });

  describe('refundPayment', () => {
    it('should delegate to refund service', async () => {
      mockRefundService.refundPayment.mockResolvedValue({
        ...mockPayment,
        status: 'refunded',
      });

      const result = await service.refundPayment(
        paymentId,
        { amount: 5000 } as any,
        customerId,
      );

      expect(result.status).toBe('refunded');
    });
  });

  describe('getPaymentByOrderId', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getPaymentByOrderId.mockResolvedValue(mockPayment);

      const result = await service.getPaymentByOrderId(orderId);

      expect(result).toEqual(mockPayment);
    });
  });

  describe('getPaymentById', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getPaymentById.mockResolvedValue(mockPayment);

      const result = await service.getPaymentById(paymentId);

      expect(result).toEqual(mockPayment);
    });
  });

  describe('getAllPayments', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getAllPayments.mockResolvedValue([mockPayment]);

      const result = await service.getAllPayments();

      expect(result).toEqual([mockPayment]);
    });
  });

  describe('getCustomerPayments', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getCustomerPayments.mockResolvedValue([mockPayment]);

      const result = await service.getCustomerPayments(customerId);

      expect(result).toEqual([mockPayment]);
    });
  });

  describe('getStorePayments', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getStorePayments.mockResolvedValue([mockPayment]);

      const result = await service.getStorePayments(storeId);

      expect(result).toEqual([mockPayment]);
    });
  });
});
