import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DisputeRepository } from './dispute.repository';
import { Dispute } from '../../../../database/schemas/dispute.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';

describe('DisputeRepository', () => {
  let repository: DisputeRepository;
  let mockModel: any;

  const disputeId = generateObjectId();
  const orderId = generateObjectId();
  const customerId = generateObjectId();

  const mockDispute = {
    _id: disputeId,
    orderId,
    customerId,
    reason: 'Product damaged',
    status: 'open',
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockDispute]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeRepository,
        { provide: getModelToken(Dispute.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<DisputeRepository>(DisputeRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByOrderId', () => {
    it('should find disputes by order ID', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockDispute]),
      });

      const result = await repository.findByOrderId(orderId);

      expect(result).toEqual([mockDispute]);
    });
  });

  describe('findByCustomerId', () => {
    it('should find disputes by customer ID with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockDispute]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByCustomerId(customerId, 1, 10);

      expect(result.data).toEqual([mockDispute]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByStatus', () => {
    it('should find disputes by status with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockDispute]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByStatus('open', 1, 10);

      expect(result.data).toEqual([mockDispute]);
    });
  });
});
