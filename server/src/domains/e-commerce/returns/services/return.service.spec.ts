import { Test, TestingModule } from '@nestjs/testing';
import { ReturnService } from './return.service';
import { ReturnRequestService } from './return-request.service';
import { ReturnProcessingService } from './return-processing.service';
import { ReturnQueryService } from './return-query.service';
import { generateObjectId } from '../../../shared/testing';

describe('ReturnService', () => {
  let service: ReturnService;

  const mockRequestService = {
    create: jest.fn(),
    update: jest.fn(),
    storeRespond: jest.fn(),
    adminReview: jest.fn(),
  };

  const mockProcessingService = {
    markAsPickedUp: jest.fn(),
    markAsInspected: jest.fn(),
    processRefund: jest.fn(),
  };

  const mockQueryService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByCustomer: jest.fn(),
    getStatistics: jest.fn(),
  };

  const returnId = generateObjectId();
  const orderId = generateObjectId();
  const customerId = generateObjectId();

  const mockReturn = {
    _id: returnId,
    orderId,
    customerId,
    status: 'pending',
    reason: 'Defective product',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReturnService,
        { provide: ReturnRequestService, useValue: mockRequestService },
        { provide: ReturnProcessingService, useValue: mockProcessingService },
        { provide: ReturnQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<ReturnService>(ReturnService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should delegate to request service', async () => {
      mockRequestService.create.mockResolvedValue(mockReturn);

      const result = await service.create(
        { orderId, reason: 'Defective' } as any,
        customerId,
      );

      expect(result).toEqual(mockReturn);
    });
  });

  describe('update', () => {
    it('should delegate to request service', async () => {
      mockRequestService.update.mockResolvedValue({
        ...mockReturn,
        reason: 'Updated reason',
      });

      const result = await service.update(returnId, {
        reason: 'Updated reason',
      } as any);

      expect(result.reason).toBe('Updated reason');
    });
  });

  describe('storeRespond', () => {
    it('should delegate to request service', async () => {
      mockRequestService.storeRespond.mockResolvedValue({
        ...mockReturn,
        status: 'approved',
      });

      const result = await service.storeRespond(
        returnId,
        { approved: true } as any,
        generateObjectId(),
      );

      expect(result.status).toBe('approved');
    });
  });

  describe('markAsPickedUp', () => {
    it('should delegate to processing service', async () => {
      mockProcessingService.markAsPickedUp.mockResolvedValue({
        ...mockReturn,
        status: 'picked_up',
      });

      const result = await service.markAsPickedUp(returnId);

      expect(result.status).toBe('picked_up');
    });
  });

  describe('processRefund', () => {
    it('should delegate to processing service', async () => {
      mockProcessingService.processRefund.mockResolvedValue({
        ...mockReturn,
        status: 'refunded',
      });

      const result = await service.processRefund(returnId);

      expect(result.status).toBe('refunded');
    });
  });

  describe('findAll', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findAll.mockResolvedValue({
        data: [mockReturn],
        meta: { total: 1 },
      });

      const result = await service.findAll({});

      expect(result.data).toEqual([mockReturn]);
    });
  });

  describe('findById', () => {
    it('should delegate to query service', async () => {
      mockQueryService.findById.mockResolvedValue(mockReturn);

      const result = await service.findById(returnId);

      expect(result).toEqual(mockReturn);
    });
  });

  describe('getStatistics', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getStatistics.mockResolvedValue({
        total: 20,
        pending: 5,
      });

      const result = await service.getStatistics();

      expect(result.total).toBe(20);
    });
  });
});
