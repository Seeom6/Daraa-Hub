import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { WalletRepository } from './wallet.repository';
import { Wallet } from '../../../../database/schemas/wallet.schema';
import { generateObjectId, MockModelFactory } from '../../testing';

describe('WalletRepository', () => {
  let repository: WalletRepository;
  let mockModel: any;

  const walletId = generateObjectId();
  const accountId = generateObjectId();

  const mockWallet = {
    _id: walletId,
    accountId,
    balance: 1000,
    pendingBalance: 0,
    totalDeposited: 5000,
    totalWithdrawn: 2000,
    totalSpent: 1500,
    totalEarned: 500,
    isFrozen: false,
    isActive: true,
  };

  beforeEach(async () => {
    mockModel = MockModelFactory.create(mockWallet);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletRepository,
        { provide: getModelToken(Wallet.name), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<WalletRepository>(WalletRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByAccountId', () => {
    it('should find wallet by account id', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWallet),
      });

      const result = await repository.findByAccountId(accountId);

      expect(result).toEqual(mockWallet);
      expect(mockModel.findOne).toHaveBeenCalled();
    });

    it('should return null if wallet not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByAccountId(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('createForAccount', () => {
    it('should create wallet for account', async () => {
      const newWallet = { ...mockWallet, balance: 0 };
      mockModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(newWallet),
      }));

      const result = await repository.createForAccount(accountId);

      expect(result).toEqual(newWallet);
    });
  });

  describe('getOrCreate', () => {
    it('should return existing wallet', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockWallet),
      });

      const result = await repository.getOrCreate(accountId);

      expect(result).toEqual(mockWallet);
    });

    it('should create wallet if not exists', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      const newWallet = { ...mockWallet, balance: 0 };
      mockModel.mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(newWallet),
      }));

      const result = await repository.getOrCreate(accountId);

      expect(result).toEqual(newWallet);
    });
  });

  describe('addBalance', () => {
    it('should add balance to wallet', async () => {
      const updatedWallet = { ...mockWallet, balance: 1500 };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWallet),
      });

      const result = await repository.addBalance(walletId, 500);

      expect(result?.balance).toBe(1500);
    });
  });

  describe('deductBalance', () => {
    it('should deduct balance from wallet', async () => {
      const updatedWallet = { ...mockWallet, balance: 500 };
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWallet),
      });

      const result = await repository.deductBalance(walletId, 500);

      expect(result?.balance).toBe(500);
    });

    it('should return null if insufficient balance', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.deductBalance(walletId, 5000);

      expect(result).toBeNull();
    });
  });

  describe('freezeWallet', () => {
    it('should freeze wallet', async () => {
      const frozenWallet = {
        ...mockWallet,
        isFrozen: true,
        frozenReason: 'Suspicious activity',
      };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(frozenWallet),
      });

      const result = await repository.freezeWallet(
        walletId,
        'Suspicious activity',
        accountId,
      );

      expect(result?.isFrozen).toBe(true);
    });
  });

  describe('unfreezeWallet', () => {
    it('should unfreeze wallet', async () => {
      const unfrozenWallet = { ...mockWallet, isFrozen: false };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(unfrozenWallet),
      });

      const result = await repository.unfreezeWallet(walletId);

      expect(result?.isFrozen).toBe(false);
    });
  });

  describe('updateStats', () => {
    it('should update wallet statistics with deposited', async () => {
      const updatedWallet = { ...mockWallet, totalDeposited: 6000 };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWallet),
      });

      const result = await repository.updateStats(walletId, {
        deposited: 1000,
      });

      expect(result?.totalDeposited).toBe(6000);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });

    it('should update wallet statistics with withdrawn', async () => {
      const updatedWallet = { ...mockWallet, totalWithdrawn: 3000 };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWallet),
      });

      const result = await repository.updateStats(walletId, {
        withdrawn: 1000,
      });

      expect(result?.totalWithdrawn).toBe(3000);
    });

    it('should update wallet statistics with spent', async () => {
      const updatedWallet = { ...mockWallet, totalSpent: 2500 };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWallet),
      });

      const result = await repository.updateStats(walletId, { spent: 1000 });

      expect(result?.totalSpent).toBe(2500);
    });

    it('should update wallet statistics with earned', async () => {
      const updatedWallet = { ...mockWallet, totalEarned: 1500 };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWallet),
      });

      const result = await repository.updateStats(walletId, { earned: 1000 });

      expect(result?.totalEarned).toBe(1500);
    });

    it('should update multiple stats at once', async () => {
      const updatedWallet = {
        ...mockWallet,
        totalDeposited: 6000,
        totalSpent: 2500,
      };
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedWallet),
      });

      const result = await repository.updateStats(walletId, {
        deposited: 1000,
        spent: 1000,
      });

      expect(result).toBeDefined();
    });
  });

  describe('findWithBalanceAbove', () => {
    it('should find wallets with balance above threshold', async () => {
      const wallets = [mockWallet, { ...mockWallet, balance: 2000 }];
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(wallets),
        }),
      });

      const result = await repository.findWithBalanceAbove(500);

      expect(result).toHaveLength(2);
      expect(mockModel.find).toHaveBeenCalledWith({
        balance: { $gte: 500 },
        isActive: true,
      });
    });

    it('should return empty array if no wallets above threshold', async () => {
      mockModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await repository.findWithBalanceAbove(10000);

      expect(result).toHaveLength(0);
    });
  });
});
