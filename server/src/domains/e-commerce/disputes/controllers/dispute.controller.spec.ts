import { Test, TestingModule } from '@nestjs/testing';
import { DisputeController } from './dispute.controller';
import { DisputeService } from '../services/dispute.service';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { generateObjectId } from '../../../shared/testing';

describe('DisputeController', () => {
  let controller: DisputeController;

  const mockDisputeService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    findById: jest.fn(),
    addMessage: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    resolve: jest.fn(),
    close: jest.fn(),
    getStatistics: jest.fn(),
  };

  const userId = generateObjectId();
  const disputeId = generateObjectId();

  const mockReq = { user: { profileId: userId } };

  const mockDispute = {
    _id: disputeId,
    orderId: generateObjectId(),
    status: 'open',
    messages: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisputeController],
      providers: [{ provide: DisputeService, useValue: mockDisputeService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DisputeController>(DisputeController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create dispute', async () => {
      mockDisputeService.create.mockResolvedValue(mockDispute);

      const result = await controller.create(
        { orderId: generateObjectId() } as any,
        mockReq,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDispute);
    });
  });

  describe('getMyDisputes', () => {
    it('should return user disputes', async () => {
      mockDisputeService.findByUser.mockResolvedValue({
        data: [mockDispute],
        meta: {},
      });

      const result = await controller.getMyDisputes({} as any, mockReq);

      expect(result.success).toBe(true);
    });
  });

  describe('getById', () => {
    it('should return dispute by id', async () => {
      mockDisputeService.findById.mockResolvedValue(mockDispute);

      const result = await controller.getById(disputeId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDispute);
    });
  });

  describe('addMessage', () => {
    it('should add message to dispute', async () => {
      mockDisputeService.addMessage.mockResolvedValue(mockDispute);

      const result = await controller.addMessage(
        disputeId,
        { message: 'Hello' } as any,
        mockReq,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('getAllDisputes', () => {
    it('should return all disputes for admin', async () => {
      mockDisputeService.findAll.mockResolvedValue({
        data: [mockDispute],
        meta: {},
      });

      const result = await controller.getAllDisputes({} as any);

      expect(result.success).toBe(true);
    });
  });

  describe('updateDispute', () => {
    it('should update dispute', async () => {
      mockDisputeService.update.mockResolvedValue(mockDispute);

      const result = await controller.updateDispute(disputeId, {
        status: 'in_progress',
      } as any);

      expect(result.success).toBe(true);
    });
  });

  describe('resolveDispute', () => {
    it('should resolve dispute', async () => {
      mockDisputeService.resolve.mockResolvedValue({
        ...mockDispute,
        status: 'resolved',
      });

      const result = await controller.resolveDispute(
        disputeId,
        { resolution: 'Refund' } as any,
        mockReq,
      );

      expect(result.success).toBe(true);
    });
  });

  describe('closeDispute', () => {
    it('should close dispute', async () => {
      mockDisputeService.close.mockResolvedValue({
        ...mockDispute,
        status: 'closed',
      });

      const result = await controller.closeDispute(disputeId, mockReq);

      expect(result.success).toBe(true);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', async () => {
      mockDisputeService.getStatistics.mockResolvedValue({ total: 10 });

      const result = await controller.getStatistics({});

      expect(result.success).toBe(true);
      expect(result.data.total).toBe(10);
    });
  });
});
