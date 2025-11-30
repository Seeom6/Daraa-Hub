import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DisputeService } from './dispute.service';
import { DisputeRepository } from '../repositories/dispute.repository';
import { DisputeResolutionService } from './dispute-resolution.service';
import { DisputeMessageService } from './dispute-message.service';
import { DisputeQueryService } from './dispute-query.service';
import { generateObjectId } from '../../../shared/testing';

describe('DisputeService', () => {
  let service: DisputeService;

  const disputeId = generateObjectId();
  const orderId = generateObjectId();
  const userId = generateObjectId();
  const reportedAgainstId = generateObjectId();

  const mockDispute = {
    _id: disputeId,
    orderId,
    reportedBy: userId,
    reportedAgainst: reportedAgainstId,
    type: 'product_issue',
    status: 'open',
    save: jest.fn(),
  };

  let mockDisputeModel: any;
  let mockDisputeRepository: any;

  const mockResolutionService = {
    resolve: jest.fn(),
    close: jest.fn(),
  };

  const mockMessageService = {
    addMessage: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    getStatistics: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    mockDisputeModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: disputeId,
      save: jest.fn().mockResolvedValue({ ...data, _id: disputeId }),
    }));
    mockDisputeModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockDispute),
    });

    mockDisputeRepository = {
      getModel: jest.fn().mockReturnValue(mockDisputeModel),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisputeService,
        { provide: DisputeRepository, useValue: mockDisputeRepository },
        { provide: DisputeResolutionService, useValue: mockResolutionService },
        { provide: DisputeMessageService, useValue: mockMessageService },
        { provide: DisputeQueryService, useValue: mockQueryService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<DisputeService>(DisputeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a dispute successfully', async () => {
      const createDto = {
        orderId,
        reportedAgainst: reportedAgainstId,
        type: 'product_issue',
        description: 'Product damaged',
      };

      const result = await service.create(createDto as any, userId);

      expect(mockDisputeRepository.getModel).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'dispute.created',
        expect.any(Object),
      );
    });
  });

  describe('update', () => {
    it('should throw BadRequestException for invalid id', async () => {
      await expect(service.update('invalid-id', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when dispute not found', async () => {
      mockDisputeModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(disputeId, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update dispute successfully', async () => {
      const updateDto = { status: 'in_progress' };

      const result = await service.update(disputeId, updateDto);

      expect(mockDisputeModel.findByIdAndUpdate).toHaveBeenCalledWith(
        disputeId,
        updateDto,
        { new: true },
      );
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'dispute.updated',
        expect.any(Object),
      );
    });

    it('should convert assignedTo to ObjectId when provided', async () => {
      const assignedToId = generateObjectId();
      const updateDto = { assignedTo: assignedToId };

      await service.update(disputeId, updateDto);

      expect(mockDisputeModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });

  describe('findByUser', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findByUser.mockResolvedValue({
        data: [mockDispute],
        meta: { total: 1 },
      });

      const result = await service.findByUser(userId, {});

      expect(mockQueryService.findByUser).toHaveBeenCalledWith(userId, {});
      expect(result.data).toEqual([mockDispute]);
    });
  });

  describe('resolve', () => {
    it('should delegate to resolution service', async () => {
      mockResolutionService.resolve.mockResolvedValue({
        ...mockDispute,
        status: 'resolved',
      });

      const result = await service.resolve(
        disputeId,
        { resolution: 'Refund issued' } as any,
        userId,
      );

      expect(result.status).toBe('resolved');
    });
  });

  describe('close', () => {
    it('should delegate to resolution service', async () => {
      mockResolutionService.close.mockResolvedValue({
        ...mockDispute,
        status: 'closed',
      });

      const result = await service.close(disputeId, userId);

      expect(result.status).toBe('closed');
    });
  });

  describe('addMessage', () => {
    it('should delegate to message service', async () => {
      mockMessageService.addMessage.mockResolvedValue(mockDispute);

      const result = await service.addMessage(
        disputeId,
        { content: 'Test message' } as any,
        userId,
      );

      expect(result).toEqual(mockDispute);
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockDispute],
        meta: { total: 1 },
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockDispute]);
    });
  });

  describe('findById', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findById.mockResolvedValue(mockDispute);

      const result = await service.findById(disputeId);

      expect(result).toEqual(mockDispute);
    });
  });

  describe('getStatistics', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getStatistics.mockResolvedValue({ total: 10, open: 5 });

      const result = await service.getStatistics();

      expect(result.total).toBe(10);
    });
  });
});
