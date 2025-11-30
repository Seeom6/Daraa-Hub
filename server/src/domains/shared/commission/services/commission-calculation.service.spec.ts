import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CommissionCalculationService } from './commission-calculation.service';
import { CommissionRepository } from '../repositories/commission.repository';
import { CommissionConfigRepository } from '../repositories/commission-config.repository';
import { CommissionStatus } from '../../../../database/schemas/commission.schema';
import { generateObjectId } from '../../testing';

describe('CommissionCalculationService', () => {
  let service: CommissionCalculationService;
  let commissionRepo: jest.Mocked<CommissionRepository>;
  let configRepo: jest.Mocked<CommissionConfigRepository>;

  const orderId = generateObjectId();
  const storeAccountId = generateObjectId();
  const courierAccountId = generateObjectId();

  const mockConfig = {
    platformFeeRate: 10,
    deliveryFeeRate: 5,
    minCommission: 5,
    maxCommission: 100,
  };

  const mockCommission = {
    id: generateObjectId(),
    orderId,
    storeAccountId,
    status: CommissionStatus.PENDING,
    commissionAmount: 10,
  };

  beforeEach(async () => {
    commissionRepo = {
      findByOrderId: jest.fn(),
      createWithSession: jest.fn().mockResolvedValue(mockCommission),
      updateStatus: jest.fn().mockResolvedValue(mockCommission),
    } as any;

    configRepo = {
      getApplicableConfig: jest.fn().mockResolvedValue(mockConfig),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionCalculationService,
        { provide: CommissionRepository, useValue: commissionRepo },
        { provide: CommissionConfigRepository, useValue: configRepo },
      ],
    }).compile();

    service = module.get<CommissionCalculationService>(
      CommissionCalculationService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateAndCreateCommission', () => {
    const dto = {
      orderId,
      storeAccountId,
      courierAccountId,
      orderAmount: 100,
      deliveryFee: 20,
    };

    it('should calculate and create commission', async () => {
      commissionRepo.findByOrderId.mockResolvedValue(null);

      const result = await service.calculateAndCreateCommission(dto);

      expect(commissionRepo.createWithSession).toHaveBeenCalled();
      expect(result).toEqual(mockCommission);
    });

    it('should throw if commission already exists', async () => {
      commissionRepo.findByOrderId.mockResolvedValue(mockCommission as any);

      await expect(service.calculateAndCreateCommission(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw if no config found', async () => {
      commissionRepo.findByOrderId.mockResolvedValue(null);
      configRepo.getApplicableConfig.mockResolvedValue(null);

      await expect(service.calculateAndCreateCommission(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('calculateCommissionAmounts', () => {
    it('should calculate commission amounts correctly', () => {
      const result = service.calculateCommissionAmounts(
        100,
        20,
        mockConfig as any,
      );

      expect(result.platformCommission).toBe(10);
      expect(result.deliveryCommission).toBe(1);
      expect(result.storeNetEarnings).toBe(90);
      expect(result.courierNetEarnings).toBe(19);
      expect(result.platformNetEarnings).toBe(11);
    });

    it('should apply minimum commission', () => {
      const config = { ...mockConfig, platformFeeRate: 1 };
      const result = service.calculateCommissionAmounts(100, 0, config as any);

      expect(result.platformCommission).toBe(5); // minCommission
    });

    it('should apply maximum commission', () => {
      const config = { ...mockConfig, platformFeeRate: 50, maxCommission: 30 };
      const result = service.calculateCommissionAmounts(100, 0, config as any);

      expect(result.platformCommission).toBe(30); // maxCommission
    });
  });

  describe('collectCommission', () => {
    it('should collect pending commission', async () => {
      commissionRepo.findByOrderId.mockResolvedValue(mockCommission as any);

      await service.collectCommission(orderId);

      expect(commissionRepo.updateStatus).toHaveBeenCalledWith(
        mockCommission.id,
        CommissionStatus.COLLECTED,
        undefined,
      );
    });

    it('should throw if commission not found', async () => {
      commissionRepo.findByOrderId.mockResolvedValue(null);

      await expect(service.collectCommission(orderId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw if commission not pending', async () => {
      commissionRepo.findByOrderId.mockResolvedValue({
        ...mockCommission,
        status: CommissionStatus.COLLECTED,
      } as any);

      await expect(service.collectCommission(orderId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelCommission', () => {
    it('should cancel commission', async () => {
      commissionRepo.findByOrderId.mockResolvedValue(mockCommission as any);

      await service.cancelCommission(orderId);

      expect(commissionRepo.updateStatus).toHaveBeenCalledWith(
        mockCommission.id,
        CommissionStatus.CANCELLED,
      );
    });

    it('should return null if no commission', async () => {
      commissionRepo.findByOrderId.mockResolvedValue(null);

      const result = await service.cancelCommission(orderId);

      expect(result).toBeNull();
    });
  });
});
