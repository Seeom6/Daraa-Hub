import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ReturnQueryService } from './return-query.service';
import { ReturnRepository } from '../repositories/return.repository';
import { ReturnStatus } from '../../../../database/schemas/return.schema';

describe('ReturnQueryService', () => {
  let service: ReturnQueryService;
  let returnRepository: jest.Mocked<ReturnRepository>;

  const mockReturn = {
    _id: new Types.ObjectId(),
    orderId: new Types.ObjectId(),
    customerId: new Types.ObjectId(),
    status: ReturnStatus.REQUESTED,
    reason: 'Defective product',
    items: [{ productId: new Types.ObjectId(), quantity: 1 }],
    refundAmount: 100,
    createdAt: new Date(),
  };

  const mockModel = {
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    aggregate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnQueryService,
        {
          provide: ReturnRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockModel),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReturnQueryService>(ReturnQueryService);
    returnRepository = module.get(ReturnRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated returns', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve([mockReturn]);
        return mockModel;
      });
      (returnRepository.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by status', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve([mockReturn]);
        return mockModel;
      });
      (returnRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({
        status: ReturnStatus.REQUESTED,
        page: 1,
        limit: 20,
      });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter by orderId', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve([mockReturn]);
        return mockModel;
      });
      (returnRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({
        orderId: mockReturn.orderId.toString(),
        page: 1,
        limit: 20,
      });

      expect(mockModel.find).toHaveBeenCalled();
    });

    it('should filter by customerId', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve([mockReturn]);
        return mockModel;
      });
      (returnRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({
        customerId: mockReturn.customerId.toString(),
        page: 1,
        limit: 20,
      });

      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return return by id', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve(mockReturn);
        return mockModel;
      });

      const result = await service.findById(mockReturn._id.toString());

      expect(result).toEqual(mockReturn);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findById('invalid')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when return not found', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 2) return Promise.resolve(null);
        return mockModel;
      });

      await expect(
        service.findById(new Types.ObjectId().toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCustomer', () => {
    it('should return returns for customer', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 1) return Promise.resolve([mockReturn]);
        return mockModel;
      });
      (returnRepository.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findByCustomer(
        mockReturn.customerId.toString(),
        { page: 1, limit: 20 },
      );

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by status for customer', async () => {
      let populateCount = 0;
      mockModel.populate.mockImplementation(() => {
        populateCount++;
        if (populateCount >= 1) return Promise.resolve([mockReturn]);
        return mockModel;
      });
      (returnRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findByCustomer(mockReturn.customerId.toString(), {
        status: ReturnStatus.APPROVED,
        page: 1,
        limit: 20,
      });

      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should return statistics without filters', async () => {
      mockModel.aggregate.mockResolvedValue([
        {
          total: 10,
          requested: 3,
          approved: 2,
          rejected: 1,
          pickedUp: 1,
          inspected: 1,
          refunded: 2,
          totalRefundAmount: 500,
        },
      ]);

      const result = await service.getStatistics();

      expect(result.total).toBe(10);
      expect(result.requested).toBe(3);
      expect(result.refunded).toBe(2);
    });

    it('should return statistics with date filters', async () => {
      mockModel.aggregate.mockResolvedValue([
        {
          total: 5,
          requested: 2,
          approved: 1,
          rejected: 0,
          pickedUp: 1,
          inspected: 0,
          refunded: 1,
          totalRefundAmount: 200,
        },
      ]);

      const result = await service.getStatistics({
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      });

      expect(result.total).toBe(5);
    });

    it('should return default statistics when no data', async () => {
      mockModel.aggregate.mockResolvedValue([]);

      const result = await service.getStatistics();

      expect(result.total).toBe(0);
      expect(result.requested).toBe(0);
      expect(result.refunded).toBe(0);
      expect(result.totalRefundAmount).toBe(0);
    });

    it('should filter with only startDate', async () => {
      mockModel.aggregate.mockResolvedValue([{ total: 3 }]);

      const result = await service.getStatistics({ startDate: '2025-01-01' });

      expect(result.total).toBe(3);
    });

    it('should filter with only endDate', async () => {
      mockModel.aggregate.mockResolvedValue([{ total: 4 }]);

      const result = await service.getStatistics({ endDate: '2025-12-31' });

      expect(result.total).toBe(4);
    });
  });
});
