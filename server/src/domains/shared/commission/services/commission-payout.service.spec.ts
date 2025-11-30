import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { CommissionPayoutService } from './commission-payout.service';
import { CommissionRepository } from '../repositories/commission.repository';
import { WalletService } from '../../wallet/services/wallet.service';
import { CommissionStatus } from '../../../../database/schemas/commission.schema';
import { generateObjectId } from '../../testing';

describe('CommissionPayoutService', () => {
  let service: CommissionPayoutService;
  let commissionRepo: jest.Mocked<CommissionRepository>;
  let walletService: jest.Mocked<WalletService>;
  let connection: any;

  const accountId = generateObjectId();
  const performedBy = generateObjectId();

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn(),
  };

  const mockCommission = {
    id: generateObjectId(),
    storeNetEarnings: 100,
    courierNetEarnings: 50,
    status: CommissionStatus.COLLECTED,
  };

  beforeEach(async () => {
    commissionRepo = {
      getStoreSummary: jest.fn().mockResolvedValue({ pendingEarnings: 200 }),
      findByStoreAccountId: jest.fn().mockResolvedValue([mockCommission]),
      findByCourierAccountId: jest.fn().mockResolvedValue([mockCommission]),
      updateStatus: jest.fn().mockResolvedValue(mockCommission),
    } as any;

    walletService = {
      addEarnings: jest.fn().mockResolvedValue(true),
    } as any;

    connection = {
      startSession: jest.fn().mockResolvedValue(mockSession),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommissionPayoutService,
        { provide: CommissionRepository, useValue: commissionRepo },
        { provide: WalletService, useValue: walletService },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get<CommissionPayoutService>(CommissionPayoutService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('payoutStoreEarnings', () => {
    const payoutDto = { accountId, notes: 'Monthly payout' };

    it('should payout store earnings', async () => {
      const result = await service.payoutStoreEarnings(payoutDto, performedBy);

      expect(result.paidAmount).toBe(200);
      expect(result.transactionRef).toContain('PAYOUT-');
      expect(walletService.addEarnings).toHaveBeenCalled();
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should payout specific amount', async () => {
      const result = await service.payoutStoreEarnings(
        { ...payoutDto, amount: 100 },
        performedBy,
      );

      expect(result.paidAmount).toBe(100);
    });

    it('should throw if no pending earnings', async () => {
      commissionRepo.getStoreSummary.mockResolvedValue({ pendingEarnings: 0 });

      await expect(
        service.payoutStoreEarnings(payoutDto, performedBy),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if amount exceeds pending', async () => {
      await expect(
        service.payoutStoreEarnings({ ...payoutDto, amount: 500 }, performedBy),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rollback on error', async () => {
      walletService.addEarnings.mockRejectedValue(new Error('Wallet error'));

      await expect(
        service.payoutStoreEarnings(payoutDto, performedBy),
      ).rejects.toThrow('Wallet error');
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('payoutCourierEarnings', () => {
    const payoutDto = { accountId, notes: 'Weekly payout' };

    it('should payout courier earnings', async () => {
      const result = await service.payoutCourierEarnings(
        payoutDto,
        performedBy,
      );

      expect(result.paidAmount).toBe(50);
      expect(result.transactionRef).toContain('PAYOUT-');
      expect(walletService.addEarnings).toHaveBeenCalled();
    });

    it('should throw if no pending earnings', async () => {
      commissionRepo.findByCourierAccountId.mockResolvedValue([]);

      await expect(
        service.payoutCourierEarnings(payoutDto, performedBy),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if amount exceeds pending', async () => {
      await expect(
        service.payoutCourierEarnings(
          { ...payoutDto, amount: 500 },
          performedBy,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should rollback on error', async () => {
      walletService.addEarnings.mockRejectedValue(new Error('Wallet error'));

      await expect(
        service.payoutCourierEarnings(payoutDto, performedBy),
      ).rejects.toThrow('Wallet error');
      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });
});
