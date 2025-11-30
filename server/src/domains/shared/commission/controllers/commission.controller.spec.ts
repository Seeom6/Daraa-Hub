import { Test, TestingModule } from '@nestjs/testing';
import { CommissionController } from './commission.controller';
import { CommissionService } from '../services/commission.service';
import { JwtAuthGuard, RolesGuard } from '../../../../common/guards';
import { CommissionStatus } from '../../../../database/schemas/commission.schema';
import { generateObjectId } from '../../testing';

describe('CommissionController', () => {
  let controller: CommissionController;
  let commissionService: jest.Mocked<CommissionService>;

  const accountId = generateObjectId();
  const mockReq = { user: { accountId } };

  const mockCommission = {
    _id: generateObjectId(),
    orderId: generateObjectId(),
    status: CommissionStatus.COLLECTED,
  };

  const mockConfig = {
    _id: generateObjectId(),
    platformCommissionRate: 10,
    isGlobal: true,
  };

  beforeEach(async () => {
    commissionService = {
      getStoreSummary: jest.fn().mockResolvedValue({ totalEarnings: 1000 }),
      getStoreCommissions: jest
        .fn()
        .mockResolvedValue({ data: [mockCommission], total: 1 }),
      getPlatformSummary: jest
        .fn()
        .mockResolvedValue({ totalCommissions: 5000 }),
      getCommissionByOrderId: jest.fn().mockResolvedValue(mockCommission),
      payoutStoreEarnings: jest.fn().mockResolvedValue({ paidAmount: 500 }),
      payoutCourierEarnings: jest.fn().mockResolvedValue({ paidAmount: 200 }),
      getAllConfigs: jest.fn().mockResolvedValue([mockConfig]),
      getGlobalConfig: jest.fn().mockResolvedValue(mockConfig),
      getConfig: jest.fn().mockResolvedValue(mockConfig),
      createConfig: jest.fn().mockResolvedValue(mockConfig),
      updateConfig: jest.fn().mockResolvedValue(mockConfig),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommissionController],
      providers: [{ provide: CommissionService, useValue: commissionService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommissionController>(CommissionController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyStoreSummary', () => {
    it('should return store summary', async () => {
      const result = await controller.getMyStoreSummary(mockReq);

      expect(result).toEqual({ totalEarnings: 1000 });
      expect(commissionService.getStoreSummary).toHaveBeenCalledWith(
        accountId,
        undefined,
        undefined,
      );
    });
  });

  describe('getMyStoreCommissions', () => {
    it('should return store commissions', async () => {
      const result = await controller.getMyStoreCommissions(mockReq);

      expect(result).toEqual({ data: [mockCommission], total: 1 });
    });
  });

  describe('getPlatformSummary', () => {
    it('should return platform summary', async () => {
      const result = await controller.getPlatformSummary();

      expect(result).toEqual({ totalCommissions: 5000 });
    });
  });

  describe('getStoreSummaryAdmin', () => {
    it('should return store summary for admin', async () => {
      const result = await controller.getStoreSummaryAdmin(accountId);

      expect(result).toEqual({ totalEarnings: 1000 });
    });
  });

  describe('getOrderCommission', () => {
    it('should return commission by order ID', async () => {
      const orderId = generateObjectId();

      const result = await controller.getOrderCommission(orderId);

      expect(result).toEqual(mockCommission);
    });
  });

  describe('payoutStore', () => {
    it('should payout store earnings', async () => {
      const dto = { accountId, amount: 500 };

      const result = await controller.payoutStore(mockReq, dto, '127.0.0.1');

      expect(result).toEqual({ paidAmount: 500 });
    });
  });

  describe('payoutCourier', () => {
    it('should payout courier earnings', async () => {
      const dto = { accountId, amount: 200 };

      const result = await controller.payoutCourier(mockReq, dto, '127.0.0.1');

      expect(result).toEqual({ paidAmount: 200 });
    });
  });

  describe('getAllConfigs', () => {
    it('should return all configs', async () => {
      const result = await controller.getAllConfigs();

      expect(result).toEqual([mockConfig]);
    });
  });

  describe('getGlobalConfig', () => {
    it('should return global config', async () => {
      const result = await controller.getGlobalConfig();

      expect(result).toEqual(mockConfig);
    });
  });

  describe('createConfig', () => {
    it('should create config', async () => {
      const dto = { platformCommissionRate: 10, isGlobal: true };

      const result = await controller.createConfig(mockReq, dto as any);

      expect(result).toEqual(mockConfig);
    });
  });

  describe('updateConfig', () => {
    it('should update config', async () => {
      const dto = { platformCommissionRate: 15 };

      const result = await controller.updateConfig(
        mockConfig._id,
        mockReq,
        dto,
      );

      expect(result).toEqual(mockConfig);
    });
  });

  describe('getMyStoreSummary with date filters', () => {
    it('should filter by startDate and endDate', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      await controller.getMyStoreSummary(mockReq, startDate, endDate);

      expect(commissionService.getStoreSummary).toHaveBeenCalledWith(
        accountId,
        startDate,
        endDate,
      );
    });
  });

  describe('getMyStoreCommissions with filters', () => {
    it('should filter by status', async () => {
      await controller.getMyStoreCommissions(mockReq, CommissionStatus.PENDING);

      expect(commissionService.getStoreCommissions).toHaveBeenCalledWith(
        accountId,
        CommissionStatus.PENDING,
        1,
        20,
      );
    });

    it('should use custom page and limit', async () => {
      await controller.getMyStoreCommissions(mockReq, undefined, 2, 50);

      expect(commissionService.getStoreCommissions).toHaveBeenCalledWith(
        accountId,
        undefined,
        2,
        50,
      );
    });
  });

  describe('getPlatformSummary with date filters', () => {
    it('should filter by startDate and endDate', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      await controller.getPlatformSummary(startDate, endDate);

      expect(commissionService.getPlatformSummary).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
    });
  });

  describe('getStoreSummaryAdmin with date filters', () => {
    it('should filter by startDate and endDate', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';

      await controller.getStoreSummaryAdmin(accountId, startDate, endDate);

      expect(commissionService.getStoreSummary).toHaveBeenCalledWith(
        accountId,
        startDate,
        endDate,
      );
    });
  });

  describe('getStoreCommissionsAdmin', () => {
    it('should return store commissions for admin', async () => {
      const result = await controller.getStoreCommissionsAdmin(accountId);

      expect(result).toEqual({ data: [mockCommission], total: 1 });
      expect(commissionService.getStoreCommissions).toHaveBeenCalledWith(
        accountId,
        undefined,
        1,
        20,
      );
    });

    it('should filter by status', async () => {
      await controller.getStoreCommissionsAdmin(
        accountId,
        CommissionStatus.PAID,
      );

      expect(commissionService.getStoreCommissions).toHaveBeenCalledWith(
        accountId,
        CommissionStatus.PAID,
        1,
        20,
      );
    });
  });

  describe('getConfig', () => {
    it('should return config by ID', async () => {
      const result = await controller.getConfig(mockConfig._id);

      expect(result).toEqual(mockConfig);
      expect(commissionService.getConfig).toHaveBeenCalledWith(mockConfig._id);
    });
  });
});
