import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from './wallet.service';
import { WalletRepository } from '../repositories/wallet.repository';
import { WalletBalanceService } from './wallet-balance.service';
import { WalletOperationsService } from './wallet-operations.service';
import { WalletAdminService } from './wallet-admin.service';
import { generateObjectId } from '../../testing';

describe('WalletService', () => {
  let service: WalletService;

  const mockWalletRepository = {
    getOrCreate: jest.fn(),
  };

  const mockBalanceService = {
    deposit: jest.fn(),
    requestWithdrawal: jest.fn(),
    transfer: jest.fn(),
  };

  const mockOperationsService = {
    payFromWallet: jest.fn(),
    refundToWallet: jest.fn(),
    addEarnings: jest.fn(),
  };

  const mockAdminService = {
    freezeWallet: jest.fn(),
    unfreezeWallet: jest.fn(),
    adjustBalance: jest.fn(),
  };

  const accountId = generateObjectId();
  const orderId = generateObjectId();

  const mockWallet = {
    _id: generateObjectId(),
    accountId,
    balance: 10000,
    pendingBalance: 0,
    currency: 'SYP',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: WalletRepository, useValue: mockWalletRepository },
        { provide: WalletBalanceService, useValue: mockBalanceService },
        { provide: WalletOperationsService, useValue: mockOperationsService },
        { provide: WalletAdminService, useValue: mockAdminService },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWallet', () => {
    it('should get or create wallet', async () => {
      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);

      const result = await service.getWallet(accountId);

      expect(result).toEqual(mockWallet);
    });
  });

  describe('getBalance', () => {
    it('should return balance info', async () => {
      mockWalletRepository.getOrCreate.mockResolvedValue(mockWallet);

      const result = await service.getBalance(accountId);

      expect(result.balance).toBe(10000);
      expect(result.currency).toBe('SYP');
    });
  });

  describe('deposit', () => {
    it('should delegate to balance service', async () => {
      mockBalanceService.deposit.mockResolvedValue(mockWallet);

      const result = await service.deposit(
        { accountId, amount: 5000 } as any,
        accountId,
      );

      expect(result).toEqual(mockWallet);
    });
  });

  describe('requestWithdrawal', () => {
    it('should delegate to balance service', async () => {
      mockBalanceService.requestWithdrawal.mockResolvedValue({
        message: 'Success',
        transactionRef: 'TXN-123',
      });

      const result = await service.requestWithdrawal(accountId, {
        amount: 5000,
      } as any);

      expect(result.transactionRef).toBe('TXN-123');
    });
  });

  describe('transfer', () => {
    it('should delegate to balance service', async () => {
      mockBalanceService.transfer.mockResolvedValue({
        message: 'Success',
        transactionRef: 'TXN-456',
      });

      const result = await service.transfer(accountId, {
        toAccountId: generateObjectId(),
        amount: 1000,
      } as any);

      expect(result.transactionRef).toBe('TXN-456');
    });
  });

  describe('payFromWallet', () => {
    it('should delegate to operations service', async () => {
      mockOperationsService.payFromWallet.mockResolvedValue(true);

      const result = await service.payFromWallet(accountId, orderId, 5000);

      expect(result).toBe(true);
    });
  });

  describe('refundToWallet', () => {
    it('should delegate to operations service', async () => {
      mockOperationsService.refundToWallet.mockResolvedValue(true);

      const result = await service.refundToWallet(
        accountId,
        orderId,
        5000,
        'Order cancelled',
      );

      expect(result).toBe(true);
    });
  });

  describe('freezeWallet', () => {
    it('should delegate to admin service', async () => {
      mockAdminService.freezeWallet.mockResolvedValue({
        ...mockWallet,
        isFrozen: true,
      });

      const result = await service.freezeWallet(
        accountId,
        'Suspicious activity',
        accountId,
      );

      expect(result.isFrozen).toBe(true);
    });
  });

  describe('unfreezeWallet', () => {
    it('should delegate to admin service', async () => {
      mockAdminService.unfreezeWallet.mockResolvedValue({
        ...mockWallet,
        isFrozen: false,
      });

      const result = await service.unfreezeWallet(accountId);

      expect(result.isFrozen).toBe(false);
    });
  });

  describe('addEarnings', () => {
    it('should delegate to operations service', async () => {
      mockOperationsService.addEarnings.mockResolvedValue(true);

      const result = await service.addEarnings(
        accountId,
        1000,
        orderId,
        'Order earnings',
      );

      expect(result).toBe(true);
      expect(mockOperationsService.addEarnings).toHaveBeenCalledWith(
        accountId,
        1000,
        orderId,
        'Order earnings',
        undefined,
      );
    });

    it('should pass session to operations service', async () => {
      const mockSession = {} as any;
      mockOperationsService.addEarnings.mockResolvedValue(true);

      await service.addEarnings(
        accountId,
        1000,
        orderId,
        'Order earnings',
        mockSession,
      );

      expect(mockOperationsService.addEarnings).toHaveBeenCalledWith(
        accountId,
        1000,
        orderId,
        'Order earnings',
        mockSession,
      );
    });
  });

  describe('adjustBalance', () => {
    it('should delegate to admin service', async () => {
      mockAdminService.adjustBalance.mockResolvedValue(mockWallet);

      const result = await service.adjustBalance(
        { accountId, amount: 500, reason: 'Correction' } as any,
        accountId,
      );

      expect(result).toEqual(mockWallet);
    });

    it('should pass ipAddress to admin service', async () => {
      mockAdminService.adjustBalance.mockResolvedValue(mockWallet);

      await service.adjustBalance(
        { accountId, amount: 500, reason: 'Correction' } as any,
        accountId,
        '127.0.0.1',
      );

      expect(mockAdminService.adjustBalance).toHaveBeenCalledWith(
        { accountId, amount: 500, reason: 'Correction' },
        accountId,
        '127.0.0.1',
      );
    });
  });

  describe('deposit with ipAddress', () => {
    it('should pass ipAddress to balance service', async () => {
      mockBalanceService.deposit.mockResolvedValue(mockWallet);

      await service.deposit(
        { accountId, amount: 5000 } as any,
        accountId,
        '127.0.0.1',
      );

      expect(mockBalanceService.deposit).toHaveBeenCalledWith(
        { accountId, amount: 5000 },
        accountId,
        '127.0.0.1',
      );
    });
  });

  describe('requestWithdrawal with ipAddress', () => {
    it('should pass ipAddress to balance service', async () => {
      mockBalanceService.requestWithdrawal.mockResolvedValue({
        message: 'Success',
        transactionRef: 'TXN-123',
      });

      await service.requestWithdrawal(
        accountId,
        { amount: 5000 } as any,
        '127.0.0.1',
      );

      expect(mockBalanceService.requestWithdrawal).toHaveBeenCalledWith(
        accountId,
        { amount: 5000 },
        '127.0.0.1',
      );
    });
  });

  describe('transfer with ipAddress', () => {
    it('should pass ipAddress to balance service', async () => {
      const toAccountId = generateObjectId();
      mockBalanceService.transfer.mockResolvedValue({
        message: 'Success',
        transactionRef: 'TXN-456',
      });

      await service.transfer(
        accountId,
        { toAccountId, amount: 1000 } as any,
        '127.0.0.1',
      );

      expect(mockBalanceService.transfer).toHaveBeenCalledWith(
        accountId,
        { toAccountId, amount: 1000 },
        '127.0.0.1',
      );
    });
  });

  describe('payFromWallet with session', () => {
    it('should pass session to operations service', async () => {
      const mockSession = {} as any;
      mockOperationsService.payFromWallet.mockResolvedValue(true);

      await service.payFromWallet(accountId, orderId, 5000, mockSession);

      expect(mockOperationsService.payFromWallet).toHaveBeenCalledWith(
        accountId,
        orderId,
        5000,
        mockSession,
      );
    });
  });

  describe('refundToWallet with session', () => {
    it('should pass session to operations service', async () => {
      const mockSession = {} as any;
      mockOperationsService.refundToWallet.mockResolvedValue(true);

      await service.refundToWallet(
        accountId,
        orderId,
        5000,
        'Order cancelled',
        mockSession,
      );

      expect(mockOperationsService.refundToWallet).toHaveBeenCalledWith(
        accountId,
        orderId,
        5000,
        'Order cancelled',
        mockSession,
      );
    });
  });
});
