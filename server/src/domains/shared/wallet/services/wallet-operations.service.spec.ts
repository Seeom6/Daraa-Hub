import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WalletOperationsService } from './wallet-operations.service';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';
import { generateObjectId } from '../../testing';

describe('WalletOperationsService', () => {
  let service: WalletOperationsService;
  let walletRepository: jest.Mocked<WalletRepository>;
  let transactionRepository: jest.Mocked<WalletTransactionRepository>;

  const mockWalletRepository = {
    getOrCreate: jest.fn(),
    deductBalance: jest.fn(),
    addBalance: jest.fn(),
    updateStats: jest.fn(),
  };

  const mockTransactionRepository = {
    createTransaction: jest.fn(),
  };

  const accountId = generateObjectId();
  const orderId = generateObjectId();
  const walletId = generateObjectId();

  const mockWallet = {
    _id: walletId,
    accountId,
    balance: 1000,
    isFrozen: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletOperationsService,
        { provide: WalletRepository, useValue: mockWalletRepository },
        {
          provide: WalletTransactionRepository,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<WalletOperationsService>(WalletOperationsService);
    walletRepository = module.get(WalletRepository);
    transactionRepository = module.get(WalletTransactionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('payFromWallet', () => {
    it('should pay from wallet successfully', async () => {
      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.deductBalance.mockResolvedValue(true);

      const result = await service.payFromWallet(accountId, orderId, 100);

      expect(result).toBe(true);
      expect(mockWalletRepository.deductBalance).toHaveBeenCalled();
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalled();
    });

    it('should throw if wallet is frozen', async () => {
      mockWalletRepository.getOrCreate.mockResolvedValue({
        ...mockWallet,
        isFrozen: true,
      });

      await expect(
        service.payFromWallet(accountId, orderId, 100),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw if insufficient balance', async () => {
      mockWalletRepository.getOrCreate.mockResolvedValue({
        ...mockWallet,
        balance: 50,
      });

      await expect(
        service.payFromWallet(accountId, orderId, 100),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if deduction fails', async () => {
      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.deductBalance.mockResolvedValue(null);

      await expect(
        service.payFromWallet(accountId, orderId, 100),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('refundToWallet', () => {
    it('should refund to wallet successfully', async () => {
      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.addBalance.mockResolvedValue(true);

      const result = await service.refundToWallet(
        accountId,
        orderId,
        100,
        'Order cancelled',
      );

      expect(result).toBe(true);
      expect(mockWalletRepository.addBalance).toHaveBeenCalled();
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalled();
    });
  });

  describe('addEarnings', () => {
    it('should add earnings to wallet successfully', async () => {
      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.addBalance.mockResolvedValue(true);

      const result = await service.addEarnings(
        accountId,
        500,
        orderId,
        'Order earnings',
      );

      expect(result).toBe(true);
      expect(mockWalletRepository.addBalance).toHaveBeenCalled();
      expect(mockWalletRepository.updateStats).toHaveBeenCalled();
      expect(mockTransactionRepository.createTransaction).toHaveBeenCalled();
    });
  });
});
