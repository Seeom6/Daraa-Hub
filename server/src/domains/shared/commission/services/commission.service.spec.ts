import { Test, TestingModule } from '@nestjs/testing';
import { CommissionService } from './commission.service';
import { CommissionCalculationService } from './commission-calculation.service';
import { CommissionPayoutService } from './commission-payout.service';
import { CommissionQueryService } from './commission-query.service';
import { generateObjectId } from '../../testing';

describe('CommissionService', () => {
  let service: CommissionService;

  const mockCalculationService = {
    calculateAndCreateCommission: jest.fn(),
    collectCommission: jest.fn(),
    cancelCommission: jest.fn(),
  };

  const mockPayoutService = {
    payoutStoreEarnings: jest.fn(),
    payoutCourierEarnings: jest.fn(),
  };

  const mockQueryService = {
    getCommissionByOrderId: jest.fn(),
    getStoreCommissions: jest.fn(),
    getStoreSummary: jest.fn(),
    getPlatformSummary: jest.fn(),
    createConfig: jest.fn(),
    updateConfig: jest.fn(),
    getConfig: jest.fn(),
    getAllConfigs: jest.fn(),
    getGlobalConfig: jest.fn(),
  };

  const orderId = generateObjectId();
  const storeAccountId = generateObjectId();

  const mockCommission = {
    _id: generateObjectId(),
    orderId,
    storeAccountId,
    orderAmount: 50000,
    storeNetEarnings: 45000,
    courierNetEarnings: 3000,
    platformNetEarnings: 2000,
    toObject: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionService,
        {
          provide: CommissionCalculationService,
          useValue: mockCalculationService,
        },
        { provide: CommissionPayoutService, useValue: mockPayoutService },
        { provide: CommissionQueryService, useValue: mockQueryService },
      ],
    }).compile();

    service = module.get<CommissionService>(CommissionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateAndCreateCommission', () => {
    it('should delegate to calculation service', async () => {
      mockCalculationService.calculateAndCreateCommission.mockResolvedValue(
        mockCommission,
      );

      const result = await service.calculateAndCreateCommission({
        orderId,
        storeAccountId,
        orderAmount: 50000,
      } as any);

      expect(result).toEqual(mockCommission);
    });
  });

  describe('collectCommission', () => {
    it('should delegate to calculation service', async () => {
      mockCalculationService.collectCommission.mockResolvedValue(
        mockCommission,
      );

      const result = await service.collectCommission(orderId);

      expect(result).toEqual(mockCommission);
    });
  });

  describe('cancelCommission', () => {
    it('should delegate to calculation service', async () => {
      mockCalculationService.cancelCommission.mockResolvedValue(mockCommission);

      const result = await service.cancelCommission(orderId);

      expect(result).toEqual(mockCommission);
    });
  });

  describe('payoutStoreEarnings', () => {
    it('should delegate to payout service', async () => {
      mockPayoutService.payoutStoreEarnings.mockResolvedValue({
        paidAmount: 45000,
        transactionRef: 'TXN-123',
      });

      const result = await service.payoutStoreEarnings(
        { storeAccountId } as any,
        storeAccountId,
      );

      expect(result.paidAmount).toBe(45000);
    });
  });

  describe('getCommissionByOrderId', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getCommissionByOrderId.mockResolvedValue(mockCommission);

      const result = await service.getCommissionByOrderId(orderId);

      expect(result).toEqual(mockCommission);
    });
  });

  describe('getStoreSummary', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getStoreSummary.mockResolvedValue({
        totalEarnings: 100000,
      });

      const result = await service.getStoreSummary(storeAccountId);

      expect(result.totalEarnings).toBe(100000);
    });
  });

  describe('getGlobalConfig', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getGlobalConfig.mockResolvedValue({
        storeCommissionRate: 10,
      });

      const result = await service.getGlobalConfig();

      expect(result.storeCommissionRate).toBe(10);
    });
  });

  describe('calculateOrderCommission', () => {
    it('should calculate and collect commission for order', async () => {
      mockCalculationService.calculateAndCreateCommission.mockResolvedValue(
        mockCommission,
      );
      mockCalculationService.collectCommission.mockResolvedValue(
        mockCommission,
      );

      const result = await service.calculateOrderCommission(
        orderId,
        storeAccountId,
        50000,
        5000,
        generateObjectId(),
      );

      expect(result.storeEarnings).toBe(45000);
      expect(result.courierEarnings).toBe(3000);
      expect(result.platformFee).toBe(2000);
      expect(
        mockCalculationService.calculateAndCreateCommission,
      ).toHaveBeenCalled();
      expect(mockCalculationService.collectCommission).toHaveBeenCalledWith(
        orderId,
      );
    });
  });

  describe('payoutCourierEarnings', () => {
    it('should delegate to payout service', async () => {
      const courierAccountId = generateObjectId();
      mockPayoutService.payoutCourierEarnings.mockResolvedValue({
        paidAmount: 3000,
        transactionRef: 'TXN-456',
      });

      const result = await service.payoutCourierEarnings(
        { courierAccountId } as any,
        courierAccountId,
        '192.168.1.1',
      );

      expect(result.paidAmount).toBe(3000);
      expect(result.transactionRef).toBe('TXN-456');
      expect(mockPayoutService.payoutCourierEarnings).toHaveBeenCalledWith(
        { courierAccountId },
        courierAccountId,
        '192.168.1.1',
      );
    });
  });

  describe('getStoreCommissions', () => {
    it('should delegate to query service with default pagination', async () => {
      mockQueryService.getStoreCommissions.mockResolvedValue({
        commissions: [],
        total: 0,
      });

      const result = await service.getStoreCommissions(storeAccountId);

      expect(mockQueryService.getStoreCommissions).toHaveBeenCalledWith(
        storeAccountId,
        undefined,
        1,
        20,
      );
      expect(result).toEqual({ commissions: [], total: 0 });
    });

    it('should delegate to query service with status filter', async () => {
      mockQueryService.getStoreCommissions.mockResolvedValue({
        commissions: [mockCommission],
        total: 1,
      });

      const result = await service.getStoreCommissions(
        storeAccountId,
        'collected' as any,
        2,
        10,
      );

      expect(mockQueryService.getStoreCommissions).toHaveBeenCalledWith(
        storeAccountId,
        'collected',
        2,
        10,
      );
    });
  });

  describe('getPlatformSummary', () => {
    it('should delegate to query service', async () => {
      mockQueryService.getPlatformSummary.mockResolvedValue({
        totalEarnings: 500000,
      });

      const result = await service.getPlatformSummary(
        '2024-01-01',
        '2024-12-31',
      );

      expect(mockQueryService.getPlatformSummary).toHaveBeenCalledWith(
        '2024-01-01',
        '2024-12-31',
      );
      expect(result.totalEarnings).toBe(500000);
    });
  });

  describe('createConfig', () => {
    it('should delegate to query service', async () => {
      const mockConfig = { _id: generateObjectId(), storeCommissionRate: 10 };
      mockQueryService.createConfig.mockResolvedValue(mockConfig);

      const result = await service.createConfig(
        { storeCommissionRate: 10 } as any,
        storeAccountId,
      );

      expect(mockQueryService.createConfig).toHaveBeenCalledWith(
        { storeCommissionRate: 10 },
        storeAccountId,
      );
      expect(result).toEqual(mockConfig);
    });
  });

  describe('updateConfig', () => {
    it('should delegate to query service', async () => {
      const configId = generateObjectId();
      const mockConfig = { _id: configId, storeCommissionRate: 15 };
      mockQueryService.updateConfig.mockResolvedValue(mockConfig);

      const result = await service.updateConfig(
        configId,
        { storeCommissionRate: 15 } as any,
        storeAccountId,
      );

      expect(mockQueryService.updateConfig).toHaveBeenCalledWith(
        configId,
        { storeCommissionRate: 15 },
        storeAccountId,
      );
      expect(result).toEqual(mockConfig);
    });
  });

  describe('getConfig', () => {
    it('should delegate to query service', async () => {
      const configId = generateObjectId();
      const mockConfig = { _id: configId, storeCommissionRate: 10 };
      mockQueryService.getConfig.mockResolvedValue(mockConfig);

      const result = await service.getConfig(configId);

      expect(mockQueryService.getConfig).toHaveBeenCalledWith(configId);
      expect(result).toEqual(mockConfig);
    });
  });

  describe('getAllConfigs', () => {
    it('should delegate to query service', async () => {
      const mockConfigs = [
        { _id: generateObjectId(), storeCommissionRate: 10 },
      ];
      mockQueryService.getAllConfigs.mockResolvedValue(mockConfigs);

      const result = await service.getAllConfigs();

      expect(mockQueryService.getAllConfigs).toHaveBeenCalled();
      expect(result).toEqual(mockConfigs);
    });
  });
});
