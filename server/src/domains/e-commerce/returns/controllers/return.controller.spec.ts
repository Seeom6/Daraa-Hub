import { Test, TestingModule } from '@nestjs/testing';
import { ReturnController } from './return.controller';
import { ReturnService } from '../services/return.service';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { generateObjectId } from '../../../shared/testing';

describe('ReturnController', () => {
  let controller: ReturnController;

  const mockReturnService = {
    create: jest.fn(),
    findByCustomer: jest.fn(),
    findById: jest.fn(),
    storeRespond: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    adminReview: jest.fn(),
    markAsPickedUp: jest.fn(),
    markAsInspected: jest.fn(),
    processRefund: jest.fn(),
    getStatistics: jest.fn(),
  };

  const customerId = generateObjectId();
  const returnId = generateObjectId();

  const mockReq = { user: { profileId: customerId } };

  const mockReturn = {
    _id: returnId,
    orderId: generateObjectId(),
    status: 'pending',
    reason: 'Defective product',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnController],
      providers: [{ provide: ReturnService, useValue: mockReturnService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReturnController>(ReturnController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create return request', async () => {
      mockReturnService.create.mockResolvedValue(mockReturn);

      const result = await controller.create(
        { orderId: generateObjectId() } as any,
        mockReq,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReturn);
    });
  });

  describe('getMyReturns', () => {
    it('should return customer returns', async () => {
      mockReturnService.findByCustomer.mockResolvedValue({
        data: [mockReturn],
        meta: {},
      });

      const result = await controller.getMyReturns({} as any, mockReq);

      expect(result.success).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return by id', async () => {
      mockReturnService.findById.mockResolvedValue(mockReturn);

      const result = await controller.getById(returnId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReturn);
    });
  });

  describe('storeRespond', () => {
    it('should submit store response', async () => {
      mockReturnService.storeRespond.mockResolvedValue(mockReturn);

      const result = await controller.storeRespond(
        returnId,
        { approved: true } as any,
        mockReq,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('getAllReturns', () => {
    it('should return all returns for admin', async () => {
      mockReturnService.findAll.mockResolvedValue({
        data: [mockReturn],
        meta: {},
      });

      const result = await controller.getAllReturns({} as any);

      expect(result.success).toBe(true);
    });
  });

  describe('updateReturn', () => {
    it('should update return', async () => {
      mockReturnService.update.mockResolvedValue(mockReturn);

      const result = await controller.updateReturn(returnId, {
        status: 'approved',
      } as any);

      expect(result.success).toBe(true);
    });
  });

  describe('adminReview', () => {
    it('should submit admin review', async () => {
      mockReturnService.adminReview.mockResolvedValue(mockReturn);

      const result = await controller.adminReview(
        returnId,
        { approved: true } as any,
        mockReq,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('markAsPickedUp', () => {
    it('should mark as picked up', async () => {
      mockReturnService.markAsPickedUp.mockResolvedValue(mockReturn);

      const result = await controller.markAsPickedUp(returnId);

      expect(result.success).toBe(true);
    });
  });

  describe('markAsInspected', () => {
    it('should mark as inspected', async () => {
      mockReturnService.markAsInspected.mockResolvedValue(mockReturn);

      const result = await controller.markAsInspected(returnId);

      expect(result.success).toBe(true);
    });
  });

  describe('processRefund', () => {
    it('should process refund', async () => {
      mockReturnService.processRefund.mockResolvedValue(mockReturn);

      const result = await controller.processRefund(returnId);

      expect(result.success).toBe(true);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      mockReturnService.getStatistics.mockResolvedValue({ total: 5 });

      const result = await controller.getStatistics({});

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(5);
    });
  });
});
