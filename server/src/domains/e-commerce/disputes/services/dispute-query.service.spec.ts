import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DisputeQueryService } from './dispute-query.service';
import { DisputeRepository } from '../repositories/dispute.repository';

describe('DisputeQueryService', () => {
  let service: DisputeQueryService;
  let disputeRepository: jest.Mocked<DisputeRepository>;

  const mockDisputeId = new Types.ObjectId();
  const mockUserId = new Types.ObjectId();
  const mockOrderId = new Types.ObjectId();

  const mockDispute = {
    _id: mockDisputeId,
    orderId: mockOrderId,
    reportedBy: mockUserId,
    type: 'order_issue',
    status: 'open',
    priority: 'high',
    description: 'Test dispute',
  };

  beforeEach(async () => {
    const createChainableMock = () => {
      const mock: any = {
        find: jest.fn().mockReturnThis(),
        findById: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        aggregate: jest.fn(),
        then: jest.fn(),
      };
      return mock;
    };

    const mockModel = createChainableMock();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeQueryService,
        {
          provide: DisputeRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockModel),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DisputeQueryService>(DisputeQueryService);
    disputeRepository = module.get(DisputeRepository);
  });

  describe('findAll', () => {
    it('should return paginated disputes', async () => {
      const mockModel = disputeRepository.getModel();
      // Make populate return a promise that resolves to the data
      let populateCallCount = 0;
      (mockModel.populate as jest.Mock).mockImplementation(() => {
        populateCallCount++;
        if (populateCallCount >= 3) {
          return Promise.resolve([mockDispute]);
        }
        return mockModel;
      });
      (disputeRepository.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });

    it('should apply filters', async () => {
      const mockModel = disputeRepository.getModel();
      let populateCallCount = 0;
      (mockModel.populate as jest.Mock).mockImplementation(() => {
        populateCallCount++;
        if (populateCallCount >= 3) {
          return Promise.resolve([mockDispute]);
        }
        return mockModel;
      });
      (disputeRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findAll({
        page: 1,
        limit: 20,
        status: 'open',
        type: 'order_issue',
        priority: 'high',
        orderId: mockOrderId.toString(),
        reportedBy: mockUserId.toString(),
        assignedTo: mockUserId.toString(),
      });

      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return dispute by id', async () => {
      const mockModel = disputeRepository.getModel();
      let populateCallCount = 0;
      (mockModel.populate as jest.Mock).mockImplementation(() => {
        populateCallCount++;
        if (populateCallCount >= 3) {
          return Promise.resolve(mockDispute);
        }
        return mockModel;
      });

      const result = await service.findById(mockDisputeId.toString());

      expect(result).toEqual(mockDispute);
    });

    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.findById('invalid-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when dispute not found', async () => {
      const mockModel = disputeRepository.getModel();
      let populateCallCount = 0;
      (mockModel.populate as jest.Mock).mockImplementation(() => {
        populateCallCount++;
        if (populateCallCount >= 3) {
          return Promise.resolve(null);
        }
        return mockModel;
      });

      await expect(service.findById(mockDisputeId.toString())).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return disputes for user', async () => {
      const mockModel = disputeRepository.getModel();
      let populateCallCount = 0;
      (mockModel.populate as jest.Mock).mockImplementation(() => {
        populateCallCount++;
        if (populateCallCount >= 2) {
          return Promise.resolve([mockDispute]);
        }
        return mockModel;
      });
      (disputeRepository.count as jest.Mock).mockResolvedValue(1);

      const result = await service.findByUser(mockUserId.toString(), {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should apply filters for user disputes', async () => {
      const mockModel = disputeRepository.getModel();
      let populateCallCount = 0;
      (mockModel.populate as jest.Mock).mockImplementation(() => {
        populateCallCount++;
        if (populateCallCount >= 2) {
          return Promise.resolve([mockDispute]);
        }
        return mockModel;
      });
      (disputeRepository.count as jest.Mock).mockResolvedValue(1);

      await service.findByUser(mockUserId.toString(), {
        page: 1,
        limit: 20,
        status: 'open',
        type: 'order_issue',
      });

      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('should return dispute statistics', async () => {
      const mockStats = {
        total: 10,
        open: 5,
        investigating: 2,
        resolved: 2,
        closed: 1,
        escalated: 0,
      };
      const mockModel = disputeRepository.getModel();
      (mockModel.aggregate as jest.Mock).mockResolvedValue([mockStats]);

      const result = await service.getStatistics();

      expect(result).toEqual(mockStats);
    });

    it('should return default stats when no disputes', async () => {
      const mockModel = disputeRepository.getModel();
      (mockModel.aggregate as jest.Mock).mockResolvedValue([]);

      const result = await service.getStatistics();

      expect(result.total).toBe(0);
    });

    it('should apply date filters', async () => {
      const mockModel = disputeRepository.getModel();
      (mockModel.aggregate as jest.Mock).mockResolvedValue([{ total: 5 }]);

      await service.getStatistics({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(mockModel.aggregate).toHaveBeenCalled();
    });
  });
});
