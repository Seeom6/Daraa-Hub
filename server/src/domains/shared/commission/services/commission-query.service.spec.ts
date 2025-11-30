import { Test, TestingModule } from '@nestjs/testing';
import { CommissionQueryService } from './commission-query.service';
import { CommissionRepository } from '../repositories/commission.repository';
import { CommissionConfigRepository } from '../repositories/commission-config.repository';
import { CommissionStatus } from '../../../../database/schemas/commission.schema';
import { generateObjectId } from '../../testing';

describe('CommissionQueryService', () => {
  let service: CommissionQueryService;
  let commissionRepo: jest.Mocked<CommissionRepository>;
  let configRepo: jest.Mocked<CommissionConfigRepository>;

  const orderId = generateObjectId();
  const storeAccountId = generateObjectId();
  const configId = generateObjectId();

  const mockCommission = {
    id: generateObjectId(),
    orderId,
    storeAccountId,
    status: CommissionStatus.PENDING,
  };

  const mockConfig = {
    _id: configId,
    platformFeeRate: 10,
    isActive: true,
  };

  beforeEach(async () => {
    commissionRepo = {
      findByOrderId: jest.fn().mockResolvedValue(mockCommission),
      findByStoreAccountId: jest.fn().mockResolvedValue([mockCommission]),
      getStoreSummary: jest.fn().mockResolvedValue({ totalEarnings: 1000 }),
      getPlatformSummary: jest
        .fn()
        .mockResolvedValue({ totalCommissions: 500 }),
    } as any;

    configRepo = {
      create: jest.fn().mockResolvedValue(mockConfig),
      update: jest.fn().mockResolvedValue(mockConfig),
      findById: jest.fn().mockResolvedValue(mockConfig),
      getAllActive: jest.fn().mockResolvedValue([mockConfig]),
      getGlobalConfig: jest.fn().mockResolvedValue(mockConfig),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionQueryService,
        { provide: CommissionRepository, useValue: commissionRepo },
        { provide: CommissionConfigRepository, useValue: configRepo },
      ],
    }).compile();

    service = module.get<CommissionQueryService>(CommissionQueryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCommissionByOrderId', () => {
    it('should return commission by order ID', async () => {
      const result = await service.getCommissionByOrderId(orderId);

      expect(result).toEqual(mockCommission);
      expect(commissionRepo.findByOrderId).toHaveBeenCalledWith(orderId);
    });
  });

  describe('getStoreCommissions', () => {
    it('should return store commissions with pagination', async () => {
      const result = await service.getStoreCommissions(
        storeAccountId,
        CommissionStatus.PENDING,
        1,
        20,
      );

      expect(result.data).toEqual([mockCommission]);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should use default page and limit when not provided', async () => {
      const result = await service.getStoreCommissions(storeAccountId);

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(commissionRepo.findByStoreAccountId).toHaveBeenCalledWith(
        storeAccountId,
        undefined,
        20,
        0,
      );
    });

    it('should calculate correct skip for page 2', async () => {
      await service.getStoreCommissions(storeAccountId, undefined, 2, 10);

      expect(commissionRepo.findByStoreAccountId).toHaveBeenCalledWith(
        storeAccountId,
        undefined,
        10,
        10,
      );
    });
  });

  describe('getStoreSummary', () => {
    it('should return store summary', async () => {
      const result = await service.getStoreSummary(storeAccountId);

      expect(result).toEqual({ totalEarnings: 1000 });
    });

    it('should pass date filters', async () => {
      await service.getStoreSummary(storeAccountId, '2024-01-01', '2024-12-31');

      expect(commissionRepo.getStoreSummary).toHaveBeenCalledWith(
        storeAccountId,
        expect.any(Date),
        expect.any(Date),
      );
    });

    it('should pass undefined when no dates provided', async () => {
      await service.getStoreSummary(storeAccountId);

      expect(commissionRepo.getStoreSummary).toHaveBeenCalledWith(
        storeAccountId,
        undefined,
        undefined,
      );
    });

    it('should pass only startDate when endDate not provided', async () => {
      await service.getStoreSummary(storeAccountId, '2024-01-01');

      expect(commissionRepo.getStoreSummary).toHaveBeenCalledWith(
        storeAccountId,
        expect.any(Date),
        undefined,
      );
    });
  });

  describe('getPlatformSummary', () => {
    it('should return platform summary', async () => {
      const result = await service.getPlatformSummary();

      expect(result).toEqual({ totalCommissions: 500 });
    });

    it('should pass date filters', async () => {
      await service.getPlatformSummary('2024-01-01', '2024-12-31');

      expect(commissionRepo.getPlatformSummary).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
      );
    });

    it('should pass undefined when no dates provided', async () => {
      await service.getPlatformSummary();

      expect(commissionRepo.getPlatformSummary).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });
  });

  describe('createConfig', () => {
    it('should create commission config', async () => {
      const dto = { platformFeeRate: 10, entityType: 'global' };

      const result = await service.createConfig(dto as any, 'admin123');

      expect(configRepo.create).toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    it('should create config with validFrom and validUntil dates', async () => {
      const dto = {
        platformFeeRate: 10,
        entityType: 'global',
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
      };

      await service.createConfig(dto as any, 'admin123');

      expect(configRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          validFrom: expect.any(Date),
          validUntil: expect.any(Date),
        }),
      );
    });

    it('should create config without dates', async () => {
      const dto = { platformFeeRate: 10, entityType: 'global' };

      await service.createConfig(dto as any, 'admin123');

      expect(configRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          validFrom: undefined,
          validUntil: undefined,
        }),
      );
    });
  });

  describe('updateConfig', () => {
    it('should update commission config', async () => {
      const dto = { platformFeeRate: 15 };

      const result = await service.updateConfig(
        configId,
        dto as any,
        'admin123',
      );

      expect(configRepo.update).toHaveBeenCalled();
      expect(result).toEqual(mockConfig);
    });

    it('should update config with validFrom and validUntil dates', async () => {
      const dto = {
        platformFeeRate: 15,
        validFrom: '2024-01-01',
        validUntil: '2024-12-31',
      };

      await service.updateConfig(configId, dto as any, 'admin123');

      expect(configRepo.update).toHaveBeenCalledWith(
        configId,
        expect.objectContaining({
          validFrom: expect.any(Date),
          validUntil: expect.any(Date),
        }),
      );
    });

    it('should update config without dates', async () => {
      const dto = { platformFeeRate: 15 };

      await service.updateConfig(configId, dto as any, 'admin123');

      expect(configRepo.update).toHaveBeenCalledWith(
        configId,
        expect.objectContaining({
          validFrom: undefined,
          validUntil: undefined,
        }),
      );
    });
  });

  describe('getConfig', () => {
    it('should return config by ID', async () => {
      const result = await service.getConfig(configId);

      expect(result).toEqual(mockConfig);
    });
  });

  describe('getAllConfigs', () => {
    it('should return all active configs', async () => {
      const result = await service.getAllConfigs();

      expect(result).toEqual([mockConfig]);
    });
  });

  describe('getGlobalConfig', () => {
    it('should return global config', async () => {
      const result = await service.getGlobalConfig();

      expect(result).toEqual(mockConfig);
    });
  });
});
