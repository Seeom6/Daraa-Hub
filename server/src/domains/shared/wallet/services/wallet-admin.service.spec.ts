import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WalletAdminService } from './wallet-admin.service';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';
import { generateObjectId } from '../../testing';

describe('WalletAdminService', () => {
  let service: WalletAdminService;
  let mockWalletRepo: any;
  let mockTransactionRepo: any;

  const accountId = generateObjectId();
  const walletId = generateObjectId();
  const mockWallet = {
    _id: walletId,
    accountId,
    balance: 5000,
    isFrozen: false,
  };

  beforeEach(async () => {
    mockWalletRepo = {
      findByAccountId: jest.fn().mockResolvedValue(mockWallet),
      findById: jest.fn().mockResolvedValue(mockWallet),
      getOrCreate: jest.fn().mockResolvedValue(mockWallet),
      freezeWallet: jest
        .fn()
        .mockResolvedValue({ ...mockWallet, isFrozen: true }),
      unfreezeWallet: jest
        .fn()
        .mockResolvedValue({ ...mockWallet, isFrozen: false }),
      addBalance: jest.fn().mockResolvedValue(true),
      deductBalance: jest.fn().mockResolvedValue(true),
    };

    mockTransactionRepo = {
      createTransaction: jest
        .fn()
        .mockResolvedValue({ _id: generateObjectId() }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletAdminService,
        { provide: WalletRepository, useValue: mockWalletRepo },
        { provide: WalletTransactionRepository, useValue: mockTransactionRepo },
      ],
    }).compile();

    service = module.get<WalletAdminService>(WalletAdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('freezeWallet', () => {
    it('should freeze wallet', async () => {
      const result = await service.freezeWallet(
        accountId,
        'Suspicious activity',
        'admin123',
      );

      expect(result.isFrozen).toBe(true);
      expect(mockWalletRepo.freezeWallet).toHaveBeenCalled();
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockWalletRepo.findByAccountId.mockResolvedValue(null);

      await expect(
        service.freezeWallet(accountId, 'Test', 'admin'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unfreezeWallet', () => {
    it('should unfreeze wallet', async () => {
      const result = await service.unfreezeWallet(accountId);

      expect(result.isFrozen).toBe(false);
      expect(mockWalletRepo.unfreezeWallet).toHaveBeenCalled();
    });

    it('should throw NotFoundException if wallet not found', async () => {
      mockWalletRepo.findByAccountId.mockResolvedValue(null);

      await expect(service.unfreezeWallet(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('adjustBalance', () => {
    it('should add balance when amount is positive', async () => {
      await service.adjustBalance(
        { accountId, amount: 1000, reason: 'Correction' },
        'admin123',
      );

      expect(mockWalletRepo.addBalance).toHaveBeenCalled();
      expect(mockTransactionRepo.createTransaction).toHaveBeenCalled();
    });

    it('should deduct balance when amount is negative', async () => {
      await service.adjustBalance(
        { accountId, amount: -500, reason: 'Correction' },
        'admin123',
      );

      expect(mockWalletRepo.deductBalance).toHaveBeenCalled();
    });

    it('should throw BadRequestException if balance would become negative', async () => {
      await expect(
        service.adjustBalance(
          { accountId, amount: -10000, reason: 'Test' },
          'admin',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
