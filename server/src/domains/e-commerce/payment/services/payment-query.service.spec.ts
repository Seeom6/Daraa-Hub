import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PaymentQueryService } from './payment-query.service';
import { PaymentRepository } from '../repositories/payment.repository';
import { generateObjectId } from '../../../shared/testing';

describe('PaymentQueryService', () => {
  let service: PaymentQueryService;
  let paymentRepository: jest.Mocked<PaymentRepository>;

  const paymentId = generateObjectId();
  const orderId = generateObjectId();
  const customerId = generateObjectId();
  const storeId = generateObjectId();

  const mockPayment = {
    _id: paymentId,
    orderId,
    customerId,
    storeId,
    amount: 100,
    status: 'completed',
  };

  beforeEach(async () => {
    const mockPaymentModel = {
      findOne: jest.fn().mockReturnValue(mockPayment),
      findById: jest.fn().mockReturnValue(mockPayment),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockPayment]),
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue([mockPayment]),
            }),
          }),
        }),
      }),
    };

    paymentRepository = {
      getModel: jest.fn().mockReturnValue(mockPaymentModel),
      count: jest.fn().mockResolvedValue(1),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentQueryService,
        { provide: PaymentRepository, useValue: paymentRepository },
      ],
    }).compile();

    service = module.get<PaymentQueryService>(PaymentQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPaymentByOrderId', () => {
    it('should return payment by order ID', async () => {
      const result = await service.getPaymentByOrderId(orderId);

      expect(result).toEqual(mockPayment);
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by ID', async () => {
      const result = await service.getPaymentById(paymentId);

      expect(result).toEqual(mockPayment);
    });

    it('should throw if payment not found', async () => {
      paymentRepository.getModel().findById = jest.fn().mockReturnValue(null);

      await expect(service.getPaymentById(paymentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const result = await service.getAllPayments();

      expect(result).toEqual([mockPayment]);
    });
  });

  describe('getCustomerPayments', () => {
    it('should return customer payments', async () => {
      const result = await service.getCustomerPayments(customerId);

      expect(result).toEqual([mockPayment]);
    });
  });

  describe('getStorePayments', () => {
    it('should return store payments', async () => {
      const result = await service.getStorePayments(storeId);

      expect(result).toEqual([mockPayment]);
    });
  });

  describe('getPaymentsWithPagination', () => {
    it('should return paginated payments', async () => {
      const result = await service.getPaymentsWithPagination({}, 1, 10);

      expect(result.data).toEqual([mockPayment]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
