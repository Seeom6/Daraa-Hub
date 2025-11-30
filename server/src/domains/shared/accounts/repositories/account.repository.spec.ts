import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { AccountRepository } from './account.repository';
import { Account } from '../../../../database/schemas/account.schema';
import { MockModelFactory, generateObjectId } from '../../testing';
import { FakerDataFactory } from '../../testing/mock-data.factory';

describe('AccountRepository', () => {
  let repository: AccountRepository;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = MockModelFactory.create();
    mockModel.aggregate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountRepository,
        {
          provide: getModelToken(Account.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<AccountRepository>(AccountRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByPhoneNumber', () => {
    it('should find account by phone number', async () => {
      const mockAccount = FakerDataFactory.createAccount({
        phoneNumber: '+963991234567',
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.findByPhoneNumber('+963991234567');

      expect(result).toEqual(mockAccount);
    });

    it('should return null if account not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByPhoneNumber('+963999999999');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find account by email', async () => {
      const mockAccount = FakerDataFactory.createAccount({
        email: 'test@example.com',
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.findByEmail('test@example.com');

      expect(result).toEqual(mockAccount);
    });
  });

  describe('findByRole', () => {
    it('should find accounts by role', async () => {
      const mockAccounts = FakerDataFactory.createMany(
        () => FakerDataFactory.createAccount({ role: 'customer' }),
        5,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccounts),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.findByRole('customer');

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      const accountId = generateObjectId();
      const mockAccount = FakerDataFactory.createAccount({
        lastLogin: new Date(),
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.updateLastLogin(accountId);

      expect(result).toBeDefined();
    });
  });

  describe('verifyAccount', () => {
    it('should verify account', async () => {
      const accountId = generateObjectId();
      const mockAccount = FakerDataFactory.createAccount({ isVerified: true });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.verifyAccount(accountId);

      expect(result?.isVerified).toBe(true);
    });
  });

  describe('suspendAccount', () => {
    it('should suspend account with reason', async () => {
      const accountId = generateObjectId();
      const mockAccount = FakerDataFactory.createAccount({ isSuspended: true });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.suspendAccount(
        accountId,
        'Violation of terms',
      );

      expect(result?.isSuspended).toBe(true);
    });
  });

  describe('unsuspendAccount', () => {
    it('should unsuspend account', async () => {
      const accountId = generateObjectId();
      const mockAccount = FakerDataFactory.createAccount({
        isSuspended: false,
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.unsuspendAccount(accountId);

      expect(result?.isSuspended).toBe(false);
    });
  });

  describe('banAccount', () => {
    it('should ban account with reason', async () => {
      const accountId = generateObjectId();
      const mockAccount = FakerDataFactory.createAccount({ isBanned: true });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAccount),
      });

      const result = await repository.banAccount(accountId, 'Fraud detected');

      expect(result?.isBanned).toBe(true);
    });
  });

  describe('getAccountStats', () => {
    it('should return account statistics', async () => {
      const mockStats = [
        { _id: 'customer', count: 100, verified: 80, suspended: 5, banned: 2 },
        {
          _id: 'store_owner',
          count: 50,
          verified: 45,
          suspended: 2,
          banned: 1,
        },
      ];
      mockModel.aggregate.mockResolvedValue(mockStats);

      const result = await repository.getAccountStats();

      expect(result).toEqual(mockStats);
      expect(mockModel.aggregate).toHaveBeenCalled();
    });
  });
});
