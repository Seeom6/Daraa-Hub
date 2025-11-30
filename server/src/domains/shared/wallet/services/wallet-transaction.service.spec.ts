import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WalletTransactionService } from './wallet-transaction.service';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';
import { generateObjectId } from '../../testing';

describe('WalletTransactionService', () => {
  let service: WalletTransactionService;
  let mockWalletRepository: any;
  let mockTransactionRepository: any;

  const accountId = generateObjectId();
  const mockTransaction = {
    _id: generateObjectId(),
    accountId,
    type: 'deposit',
    amount: 1000,
    status: 'completed',
    transactionRef: 'TXN-123',
  };

  const mockWallet = {
    _id: generateObjectId(),
    accountId,
    balance: 5000,
    isFrozen: false,
    isActive: true,
  };

  beforeEach(async () => {
    mockWalletRepository = {
      find: jest.fn().mockResolvedValue([mockWallet]),
    };

    mockTransactionRepository = {
      findByAccountId: jest
        .fn()
        .mockResolvedValue({ data: [mockTransaction], total: 1 }),
      findById: jest.fn().mockResolvedValue(mockTransaction),
      findByRef: jest.fn().mockResolvedValue(mockTransaction),
      findByOrderId: jest.fn().mockResolvedValue([mockTransaction]),
      getSummary: jest.fn().mockResolvedValue({
        totalDeposits: 5000,
        totalWithdrawals: 1000,
        totalPayments: 500,
        totalRefunds: 200,
        totalEarnings: 300,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletTransactionService,
        { provide: WalletRepository, useValue: mockWalletRepository },
        {
          provide: WalletTransactionRepository,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    service = module.get<WalletTransactionService>(WalletTransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const result = await service.getTransactions(accountId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('should filter by type', async () => {
      await service.getTransactions(accountId, { type: 'deposit' as any });

      expect(mockTransactionRepository.findByAccountId).toHaveBeenCalled();
    });

    it('should filter by date range', async () => {
      await service.getTransactions(accountId, {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(mockTransactionRepository.findByAccountId).toHaveBeenCalled();
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', async () => {
      const result = await service.getTransactionById(mockTransaction._id);

      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if not found', async () => {
      mockTransactionRepository.findById.mockResolvedValue(null);

      await expect(service.getTransactionById('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getTransactionByRef', () => {
    it('should return transaction by reference', async () => {
      const result = await service.getTransactionByRef('TXN-123');

      expect(result).toEqual(mockTransaction);
    });

    it('should throw NotFoundException if not found', async () => {
      mockTransactionRepository.findByRef.mockResolvedValue(null);

      await expect(service.getTransactionByRef('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOrderTransactions', () => {
    it('should return transactions for order', async () => {
      const result = await service.getOrderTransactions(generateObjectId());

      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getTransactionSummary', () => {
    it('should return transaction summary', async () => {
      const result = await service.getTransactionSummary(accountId);

      expect(result.totalDeposits).toBe(5000);
      expect(result.netBalance).toBe(4000); // 5000 + 200 + 300 - 1000 - 500
    });

    it('should filter by date range', async () => {
      await service.getTransactionSummary(
        accountId,
        '2024-01-01',
        '2024-12-31',
      );

      expect(mockTransactionRepository.getSummary).toHaveBeenCalled();
    });
  });

  describe('getWalletStats', () => {
    it('should return wallet statistics', async () => {
      const result = await service.getWalletStats();

      expect(result.totalWallets).toBe(1);
      expect(result.totalBalance).toBe(5000);
      expect(result.frozenWallets).toBe(0);
    });

    it('should handle empty wallets', async () => {
      mockWalletRepository.find.mockResolvedValue([]);

      const result = await service.getWalletStats();

      expect(result.totalWallets).toBe(0);
      expect(result.averageBalance).toBe(0);
    });
  });
});
