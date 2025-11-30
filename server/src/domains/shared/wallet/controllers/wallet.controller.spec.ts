import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { WalletService } from '../services/wallet.service';
import { WalletTransactionService } from '../services/wallet-transaction.service';
import { generateObjectId } from '../../testing';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: jest.Mocked<WalletService>;
  let transactionService: jest.Mocked<WalletTransactionService>;

  const mockWalletService = {
    getBalance: jest.fn(),
    getWallet: jest.fn(),
    requestWithdrawal: jest.fn(),
    transfer: jest.fn(),
    deposit: jest.fn(),
    freezeWallet: jest.fn(),
    unfreezeWallet: jest.fn(),
    adjustBalance: jest.fn(),
  };

  const mockTransactionService = {
    getTransactions: jest.fn(),
    getTransactionSummary: jest.fn(),
    getTransactionById: jest.fn(),
    getWalletStats: jest.fn(),
  };

  const mockRequest = {
    user: {
      accountId: generateObjectId(),
      role: 'customer',
    },
  };

  const mockWallet = {
    _id: generateObjectId(),
    accountId: mockRequest.user.accountId,
    balance: 1000,
    isFrozen: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        { provide: WalletService, useValue: mockWalletService },
        { provide: WalletTransactionService, useValue: mockTransactionService },
      ],
    }).compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get(WalletService);
    transactionService = module.get(WalletTransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('should return wallet balance', async () => {
      mockWalletService.getBalance.mockResolvedValue({ balance: 1000 });

      const result = await controller.getBalance(mockRequest);

      expect(result.balance).toBe(1000);
      expect(mockWalletService.getBalance).toHaveBeenCalledWith(
        mockRequest.user.accountId,
      );
    });
  });

  describe('getTransactions', () => {
    it('should return transactions', async () => {
      const transactions = [{ _id: generateObjectId(), amount: 100 }];
      mockTransactionService.getTransactions.mockResolvedValue(transactions);

      const result = await controller.getTransactions(mockRequest, {});

      expect(result).toEqual(transactions);
    });
  });

  describe('getTransactionSummary', () => {
    it('should return transaction summary', async () => {
      const summary = { totalDeposits: 5000, totalWithdrawals: 2000 };
      mockTransactionService.getTransactionSummary.mockResolvedValue(summary);

      const result = await controller.getTransactionSummary(mockRequest);

      expect(result).toEqual(summary);
    });
  });

  describe('getTransactionById', () => {
    it('should return transaction by id', async () => {
      const transactionId = generateObjectId();
      const transaction = { _id: transactionId, amount: 100 };
      mockTransactionService.getTransactionById.mockResolvedValue(transaction);

      const result = await controller.getTransactionById(transactionId);

      expect(result).toEqual(transaction);
    });
  });

  describe('requestWithdrawal', () => {
    it('should request withdrawal', async () => {
      const dto = { amount: 500, bankDetails: {} };
      const withdrawalResult = {
        success: true,
        message: 'Withdrawal requested',
      };
      mockWalletService.requestWithdrawal.mockResolvedValue(withdrawalResult);

      const result = await controller.requestWithdrawal(
        mockRequest,
        dto as any,
        '127.0.0.1',
      );

      expect(result).toEqual(withdrawalResult);
    });
  });

  describe('transfer', () => {
    it('should transfer funds', async () => {
      const dto = { toAccountId: generateObjectId(), amount: 100 };
      const transferResult = { success: true, message: 'Transfer completed' };
      mockWalletService.transfer.mockResolvedValue(transferResult);

      const result = await controller.transfer(
        mockRequest,
        dto as any,
        '127.0.0.1',
      );

      expect(result).toEqual(transferResult);
    });
  });

  describe('deposit', () => {
    it('should deposit funds', async () => {
      const dto = { accountId: generateObjectId(), amount: 1000 };
      const depositResult = { success: true, message: 'Deposit completed' };
      mockWalletService.deposit.mockResolvedValue(depositResult);

      const result = await controller.deposit(
        mockRequest,
        dto as any,
        '127.0.0.1',
      );

      expect(result).toEqual(depositResult);
    });
  });

  describe('freezeWallet', () => {
    it('should freeze wallet', async () => {
      const dto = {
        accountId: generateObjectId(),
        reason: 'Suspicious activity',
      };
      mockWalletService.freezeWallet.mockResolvedValue({ success: true });

      const result = await controller.freezeWallet(mockRequest, dto);

      expect(result.success).toBe(true);
    });
  });

  describe('unfreezeWallet', () => {
    it('should unfreeze wallet', async () => {
      const accountId = generateObjectId();
      mockWalletService.unfreezeWallet.mockResolvedValue({ success: true });

      const result = await controller.unfreezeWallet(accountId);

      expect(result.success).toBe(true);
    });
  });

  describe('getWalletStats', () => {
    it('should return wallet stats', async () => {
      const stats = { totalWallets: 100, totalBalance: 50000 };
      mockTransactionService.getWalletStats.mockResolvedValue(stats);

      const result = await controller.getWalletStats();

      expect(result).toEqual(stats);
    });
  });

  describe('getWalletByAccount', () => {
    it('should return wallet by account id', async () => {
      const accountId = generateObjectId();
      mockWalletService.getWallet.mockResolvedValue(mockWallet);

      const result = await controller.getWalletByAccount(accountId);

      expect(result).toEqual(mockWallet);
    });
  });
});
