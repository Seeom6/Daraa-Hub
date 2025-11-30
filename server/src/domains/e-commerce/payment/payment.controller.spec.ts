import { Test, TestingModule } from '@nestjs/testing';
import { PaymentController } from './payment.controller';
import { PaymentService } from './services/payment.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { generateObjectId } from '../../shared/testing';

describe('PaymentController', () => {
  let controller: PaymentController;
  let paymentService: jest.Mocked<PaymentService>;

  const userId = generateObjectId();
  const profileId = generateObjectId();
  const mockUser = { userId, profileId };

  const mockPayment = {
    _id: generateObjectId(),
    orderId: generateObjectId(),
    amount: 100,
    status: 'completed',
  };

  beforeEach(async () => {
    paymentService = {
      processPayment: jest.fn().mockResolvedValue(mockPayment),
      getAllPayments: jest.fn().mockResolvedValue([mockPayment]),
      getCustomerPayments: jest.fn().mockResolvedValue([mockPayment]),
      getStorePayments: jest.fn().mockResolvedValue([mockPayment]),
      getPaymentByOrderId: jest.fn().mockResolvedValue(mockPayment),
      getPaymentById: jest.fn().mockResolvedValue(mockPayment),
      refundPayment: jest.fn().mockResolvedValue(mockPayment),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [{ provide: PaymentService, useValue: paymentService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<PaymentController>(PaymentController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processPayment', () => {
    it('should process payment', async () => {
      const processDto = {
        orderId: generateObjectId(),
        amount: 100,
        method: 'cash',
      };

      const result = await controller.processPayment(
        mockUser,
        processDto as any,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment processed successfully');
      expect(paymentService.processPayment).toHaveBeenCalledWith(
        processDto,
        userId,
      );
    });
  });

  describe('getAllPayments', () => {
    it('should return all payments', async () => {
      const result = await controller.getAllPayments();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockPayment]);
    });
  });

  describe('getMyPayments', () => {
    it('should return customer payments', async () => {
      const result = await controller.getMyPayments(mockUser);

      expect(result.success).toBe(true);
      expect(paymentService.getCustomerPayments).toHaveBeenCalledWith(
        profileId,
      );
    });
  });

  describe('getStorePayments', () => {
    it('should return store payments', async () => {
      const result = await controller.getStorePayments(mockUser);

      expect(result.success).toBe(true);
      expect(paymentService.getStorePayments).toHaveBeenCalledWith(profileId);
    });
  });

  describe('getPaymentByOrderId', () => {
    it('should return payment by order ID', async () => {
      const orderId = generateObjectId();

      const result = await controller.getPaymentByOrderId(orderId);

      expect(result.success).toBe(true);
      expect(paymentService.getPaymentByOrderId).toHaveBeenCalledWith(orderId);
    });
  });

  describe('getPayment', () => {
    it('should return payment by ID', async () => {
      const result = await controller.getPayment(mockPayment._id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPayment);
    });
  });

  describe('refundPayment', () => {
    it('should refund payment', async () => {
      const refundDto = { reason: 'Customer request' };

      const result = await controller.refundPayment(
        mockUser,
        mockPayment._id,
        refundDto as any,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Payment refunded successfully');
    });
  });
});
