import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ReturnRepository } from './return.repository';
import { Return } from '../../../../database/schemas/return.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';

describe('ReturnRepository', () => {
  let repository: ReturnRepository;
  let mockModel: any;

  const returnId = generateObjectId();
  const orderId = generateObjectId();
  const customerId = generateObjectId();
  const storeId = generateObjectId();

  const mockReturn = {
    _id: returnId,
    orderId,
    customerId,
    storeId,
    reason: 'Wrong size',
    status: 'pending',
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create([mockReturn]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnRepository,
        { provide: getModelToken(Return.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<ReturnRepository>(ReturnRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByOrderId', () => {
    it('should find returns by order ID', async () => {
      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockReturn]),
      });

      const result = await repository.findByOrderId(orderId);

      expect(result).toEqual([mockReturn]);
    });
  });

  describe('findByCustomerId', () => {
    it('should find returns by customer ID with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockReturn]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByCustomerId(customerId, 1, 10);

      expect(result.data).toEqual([mockReturn]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByStoreId', () => {
    it('should find returns by store ID with pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockReturn]),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByStoreId(storeId, 1, 10);

      expect(result.data).toEqual([mockReturn]);
    });
  });
});
