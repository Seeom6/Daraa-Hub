import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WalletTransactionRepository } from './wallet-transaction.repository';
import {
  WalletTransaction,
  TransactionType,
  TransactionStatus,
} from '../../../../database/schemas/wallet-transaction.schema';
import { generateObjectId, MockModelFactory } from '../../testing';

describe('WalletTransactionRepository', () => {
  let repository: WalletTransactionRepository;
  let mockModel: any;

  const transactionId = generateObjectId();
  const walletId = generateObjectId();
  const accountId = generateObjectId();

  const mockTransaction = {
    _id: transactionId,
    walletId,
    accountId,
    type: TransactionType.DEPOSIT,
    amount: 1000,
    balanceBefore: 0,
    balanceAfter: 1000,
    status: TransactionStatus.COMPLETED,
    description: 'Deposit',
    transactionRef: 'TXN-123456',
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create(mockTransaction);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletTransactionRepository,
        { provide: getModelToken(WalletTransaction.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<WalletTransactionRepository>(
      WalletTransactionRepository,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should create transaction', async () => {
      mockModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockTransaction),
      }));

      const result = await repository.createTransaction({
        walletId,
        accountId,
        type: TransactionType.DEPOSIT,
        amount: 1000,
        balanceBefore: 0,
        balanceAfter: 1000,
        description: 'Deposit',
      });

      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findByWalletId', () => {
    it('should find transactions by wallet id', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await repository.findByWalletId(walletId);

      expect(result.data).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
    });
  });

  describe('findByAccountId', () => {
    it('should find transactions by account id', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await repository.findByAccountId(accountId);

      expect(result.data).toEqual([mockTransaction]);
      expect(result.total).toBe(1);
    });

    it('should filter by type', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await repository.findByAccountId(accountId, {
        type: TransactionType.DEPOSIT,
      });

      expect(result.data).toEqual([mockTransaction]);
    });
  });

  describe('findByRef', () => {
    it('should find transaction by reference', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTransaction),
      });

      const result = await repository.findByRef('TXN-123456');

      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findByOrderId', () => {
    it('should find transactions by order id', async () => {
      const orderId = generateObjectId();
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });

      const result = await repository.findByOrderId(orderId);

      expect(result).toEqual([mockTransaction]);
    });
  });

  describe('getSummary', () => {
    it('should return transaction summary', async () => {
      mockModel.aggregate.mockResolvedValue([
        { _id: TransactionType.DEPOSIT, total: 5000 },
        { _id: TransactionType.PAYMENT, total: 2000 },
      ]);

      const result = await repository.getSummary(accountId);

      expect(result.totalDeposits).toBe(5000);
      expect(result.totalPayments).toBe(2000);
    });

    it('should return summary with all transaction types', async () => {
      mockModel.aggregate.mockResolvedValue([
        { _id: TransactionType.DEPOSIT, total: 5000 },
        { _id: TransactionType.WITHDRAWAL, total: 1000 },
        { _id: TransactionType.PAYMENT, total: 2000 },
        { _id: TransactionType.REFUND, total: 500 },
        { _id: TransactionType.EARNING, total: 300 },
      ]);

      const result = await repository.getSummary(accountId);

      expect(result.totalDeposits).toBe(5000);
      expect(result.totalWithdrawals).toBe(1000);
      expect(result.totalPayments).toBe(2000);
      expect(result.totalRefunds).toBe(500);
      expect(result.totalEarnings).toBe(300);
    });

    it('should return zeros when no transactions', async () => {
      mockModel.aggregate.mockResolvedValue([]);

      const result = await repository.getSummary(accountId);

      expect(result.totalDeposits).toBe(0);
      expect(result.totalWithdrawals).toBe(0);
      expect(result.totalPayments).toBe(0);
      expect(result.totalRefunds).toBe(0);
      expect(result.totalEarnings).toBe(0);
    });

    it('should filter by date range', async () => {
      mockModel.aggregate.mockResolvedValue([
        { _id: TransactionType.DEPOSIT, total: 2000 },
      ]);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await repository.getSummary(accountId, startDate, endDate);

      expect(result.totalDeposits).toBe(2000);
      expect(mockModel.aggregate).toHaveBeenCalled();
    });

    it('should filter by start date only', async () => {
      mockModel.aggregate.mockResolvedValue([
        { _id: TransactionType.DEPOSIT, total: 3000 },
      ]);

      const startDate = new Date('2024-01-01');
      const result = await repository.getSummary(accountId, startDate);

      expect(result.totalDeposits).toBe(3000);
    });

    it('should filter by end date only', async () => {
      mockModel.aggregate.mockResolvedValue([
        { _id: TransactionType.DEPOSIT, total: 4000 },
      ]);

      const endDate = new Date('2024-12-31');
      const result = await repository.getSummary(accountId, undefined, endDate);

      expect(result.totalDeposits).toBe(4000);
    });
  });

  describe('findByAccountId with filters', () => {
    it('should filter by status', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await repository.findByAccountId(accountId, {
        status: TransactionStatus.COMPLETED,
      });

      expect(result.data).toEqual([mockTransaction]);
    });

    it('should filter by date range', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const result = await repository.findByAccountId(accountId, {
        startDate,
        endDate,
      });

      expect(result.data).toEqual([mockTransaction]);
    });

    it('should filter by start date only', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const startDate = new Date('2024-01-01');
      const result = await repository.findByAccountId(accountId, { startDate });

      expect(result.data).toEqual([mockTransaction]);
    });

    it('should use custom pagination', async () => {
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockTransaction]),
      });
      mockModel.countDocuments.mockResolvedValue(1);

      const result = await repository.findByAccountId(accountId, {
        page: 2,
        limit: 10,
      });

      expect(result.data).toEqual([mockTransaction]);
    });
  });

  describe('createTransaction with optional fields', () => {
    it('should create transaction with all optional fields', async () => {
      const orderId = generateObjectId();
      const paymentId = generateObjectId();
      const relatedAccountId = generateObjectId();
      const relatedTransactionId = generateObjectId();
      const performedBy = generateObjectId();

      mockModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          ...mockTransaction,
          orderId,
          paymentId,
          relatedAccountId,
          relatedTransactionId,
          performedBy,
          ipAddress: '192.168.1.1',
          metadata: { source: 'test' },
        }),
      }));

      const result = await repository.createTransaction({
        walletId,
        accountId,
        type: TransactionType.DEPOSIT,
        amount: 1000,
        balanceBefore: 0,
        balanceAfter: 1000,
        description: 'Deposit',
        descriptionAr: 'إيداع',
        orderId,
        paymentId,
        relatedAccountId,
        relatedTransactionId,
        metadata: { source: 'test' },
        performedBy,
        ipAddress: '192.168.1.1',
      });

      expect(result).toBeDefined();
    });

    it('should create transaction with session', async () => {
      const mockSession = { id: 'session-1' };
      mockModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(mockTransaction),
      }));

      const result = await repository.createTransaction(
        {
          walletId,
          accountId,
          type: TransactionType.DEPOSIT,
          amount: 1000,
          balanceBefore: 0,
          balanceAfter: 1000,
          description: 'Deposit',
        },
        mockSession as any,
      );

      expect(result).toBeDefined();
    });
  });
});
