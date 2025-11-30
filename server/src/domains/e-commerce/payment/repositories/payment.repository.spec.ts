import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PaymentRepository } from './payment.repository';
import { Payment } from '../../../../database/schemas/payment.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';

describe('PaymentRepository', () => {
  let repository: PaymentRepository;
  let mockModel: ReturnType<typeof MockModelFactory.create>;

  const mockPayment = {
    _id: generateObjectId(),
    orderId: generateObjectId(),
    customerId: generateObjectId(),
    amount: 100,
    status: 'completed',
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create(mockPayment);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentRepository,
        {
          provide: getModelToken(Payment.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<PaymentRepository>(PaymentRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByOrderId', () => {
    it('should find payment by order ID', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPayment),
      });

      const result = await repository.findByOrderId(mockPayment.orderId);

      expect(result).toEqual(mockPayment);
      expect(mockModel.findOne).toHaveBeenCalled();
    });

    it('should return null if not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByOrderId(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('findByCustomerId', () => {
    it('should find payments by customer ID with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockPayment]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByCustomerId(
        mockPayment.customerId,
        1,
        10,
      );

      expect(result.data).toEqual([mockPayment]);
      expect(result.total).toBe(1);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', async () => {
      const updatedPayment = { ...mockPayment, status: 'refunded' };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedPayment),
      });

      const result = await repository.updateStatus(mockPayment._id, 'refunded');

      expect(result.status).toBe('refunded');
    });
  });
});
