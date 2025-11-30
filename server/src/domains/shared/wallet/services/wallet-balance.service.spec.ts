import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { WalletBalanceService } from './wallet-balance.service';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletTransactionRepository } from '../repositories/wallet-transaction.repository';
import { generateObjectId } from '../../testing';

describe('WalletBalanceService', () => {
  let service: WalletBalanceService;
  let walletRepository: jest.Mocked<WalletRepository>;
  let transactionRepository: jest.Mocked<WalletTransactionRepository>;

  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn().mockResolvedValue(undefined),
    abortTransaction: jest.fn().mockResolvedValue(undefined),
    endSession: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };

  const mockWalletRepository = {
    getOrCreate: jest.fn(),
    findById: jest.fn(),
    addBalance: jest.fn(),
    deductBalance: jest.fn(),
    updateStats: jest.fn(),
  };

  const mockTransactionRepository = {
    createTransaction: jest.fn(),
  };

  const createMockWallet = (overrides = {}) => ({
    _id: generateObjectId(),
    accountId: generateObjectId(),
    balance: 1000,
    isFrozen: false,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletBalanceService,
        { provide: WalletRepository, useValue: mockWalletRepository },
        {
          provide: WalletTransactionRepository,
          useValue: mockTransactionRepository,
        },
        { provide: getConnectionToken(), useValue: mockConnection },
      ],
    }).compile();

    service = module.get<WalletBalanceService>(WalletBalanceService);
    walletRepository = module.get(WalletRepository);
    transactionRepository = module.get(WalletTransactionRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deposit', () => {
    it('should deposit amount successfully', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId });
      const updatedWallet = { ...mockWallet, balance: 1100 };

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.addBalance.mockResolvedValue(updatedWallet);
      mockWalletRepository.updateStats.mockResolvedValue(updatedWallet);
      mockTransactionRepository.createTransaction.mockResolvedValue({
        transactionRef: 'TXN-001',
      });
      mockWalletRepository.findById.mockResolvedValue(updatedWallet);

      const result = await service.deposit(
        { accountId, amount: 100, description: 'Test deposit' },
        'admin-id',
      );

      expect(result.balance).toBe(1100);
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should throw ForbiddenException when wallet is frozen', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId, isFrozen: true });

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);

      await expect(
        service.deposit({ accountId, amount: 100 }, 'admin-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('requestWithdrawal', () => {
    it('should request withdrawal successfully', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId, balance: 500 });

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.deductBalance.mockResolvedValue({
        ...mockWallet,
        balance: 400,
      });
      mockWalletRepository.updateStats.mockResolvedValue({});
      mockTransactionRepository.createTransaction.mockResolvedValue({
        transactionRef: 'TXN-002',
      });

      const result = await service.requestWithdrawal(accountId, {
        amount: 100,
      });

      expect(result.transactionRef).toBe('TXN-002');
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId, balance: 50 });

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);

      await expect(
        service.requestWithdrawal(accountId, { amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when wallet is frozen', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId, isFrozen: true });

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);

      await expect(
        service.requestWithdrawal(accountId, { amount: 100 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('transfer', () => {
    it('should transfer amount successfully', async () => {
      const fromAccountId = generateObjectId();
      const toAccountId = generateObjectId();
      const fromWallet = createMockWallet({
        accountId: fromAccountId,
        balance: 500,
      });
      const toWallet = createMockWallet({
        accountId: toAccountId,
        balance: 200,
      });

      mockWalletRepository.getOrCreate
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet);
      mockWalletRepository.deductBalance.mockResolvedValue({});
      mockWalletRepository.addBalance.mockResolvedValue({});
      mockTransactionRepository.createTransaction.mockResolvedValue({
        _id: 'txn-id',
        transactionRef: 'TXN-003',
      });

      const result = await service.transfer(fromAccountId, {
        toAccountId,
        amount: 100,
      });

      expect(result.transactionRef).toBe('TXN-003');
      expect(mockSession.commitTransaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException when transferring to same account', async () => {
      const accountId = generateObjectId();

      await expect(
        service.transfer(accountId, { toAccountId: accountId, amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when insufficient balance', async () => {
      const fromAccountId = generateObjectId();
      const toAccountId = generateObjectId();
      const fromWallet = createMockWallet({
        accountId: fromAccountId,
        balance: 50,
      });
      const toWallet = createMockWallet({ accountId: toAccountId });

      mockWalletRepository.getOrCreate
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet);

      await expect(
        service.transfer(fromAccountId, { toAccountId, amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException when sender wallet is frozen', async () => {
      const fromAccountId = generateObjectId();
      const toAccountId = generateObjectId();
      const fromWallet = createMockWallet({
        accountId: fromAccountId,
        isFrozen: true,
      });
      const toWallet = createMockWallet({ accountId: toAccountId });

      mockWalletRepository.getOrCreate
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet);

      await expect(
        service.transfer(fromAccountId, { toAccountId, amount: 100 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when receiver wallet is frozen', async () => {
      const fromAccountId = generateObjectId();
      const toAccountId = generateObjectId();
      const fromWallet = createMockWallet({
        accountId: fromAccountId,
        balance: 500,
      });
      const toWallet = createMockWallet({
        accountId: toAccountId,
        isFrozen: true,
      });

      mockWalletRepository.getOrCreate
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet);

      await expect(
        service.transfer(fromAccountId, { toAccountId, amount: 100 }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deposit with error handling', () => {
    it('should abort transaction on error', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId });

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.addBalance.mockRejectedValue(new Error('DB Error'));

      await expect(
        service.deposit({ accountId, amount: 100 }, 'admin-id'),
      ).rejects.toThrow('DB Error');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('requestWithdrawal with error handling', () => {
    it('should throw when deductBalance fails', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId, balance: 500 });

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.deductBalance.mockResolvedValue(null);

      await expect(
        service.requestWithdrawal(accountId, { amount: 100 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should abort transaction on error', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId, balance: 500 });

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.deductBalance.mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(
        service.requestWithdrawal(accountId, { amount: 100 }),
      ).rejects.toThrow('DB Error');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('transfer with error handling', () => {
    it('should abort transaction on error', async () => {
      const fromAccountId = generateObjectId();
      const toAccountId = generateObjectId();
      const fromWallet = createMockWallet({
        accountId: fromAccountId,
        balance: 500,
      });
      const toWallet = createMockWallet({ accountId: toAccountId });

      mockWalletRepository.getOrCreate
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet);
      mockWalletRepository.deductBalance.mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(
        service.transfer(fromAccountId, { toAccountId, amount: 100 }),
      ).rejects.toThrow('DB Error');

      expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
  });

  describe('deposit with ipAddress', () => {
    it('should pass ipAddress to transaction', async () => {
      const accountId = generateObjectId();
      const mockWallet = createMockWallet({ accountId });
      const updatedWallet = { ...mockWallet, balance: 1100 };

      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);
      mockWalletRepository.addBalance.mockResolvedValue(updatedWallet);
      mockWalletRepository.updateStats.mockResolvedValue(updatedWallet);
      mockTransactionRepository.createTransaction.mockResolvedValue({
        transactionRef: 'TXN-001',
      });
      mockWalletRepository.findById.mockResolvedValue(updatedWallet);

      await service.deposit(
        { accountId, amount: 100 },
        'admin-id',
        '192.168.1.1',
      );

      expect(mockTransactionRepository.createTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: '192.168.1.1' }),
        expect.anything(),
      );
    });
  });
});
