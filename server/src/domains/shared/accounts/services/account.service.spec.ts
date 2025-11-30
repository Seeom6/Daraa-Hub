import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountRepository } from '../repositories/account.repository';
import { SecurityProfileRepository } from '../repositories/security-profile.repository';
import { CustomerProfileRepository } from '../repositories/customer-profile.repository';
import { StoreOwnerProfileRepository } from '../repositories/store-owner-profile.repository';
import { CourierProfileRepository } from '../repositories/courier-profile.repository';
import { generateObjectId } from '../../testing';

describe('AccountService', () => {
  let service: AccountService;

  const mockAccountModel = { findOne: jest.fn() };

  const mockAccountRepository = {
    create: jest.fn(),
    findByPhone: jest.fn(),
    findById: jest.fn(),
    getModel: jest.fn().mockReturnValue(mockAccountModel),
  };

  const mockSecurityProfileRepository = {
    create: jest.fn(),
  };

  const mockCustomerProfileRepository = {
    findByAccountId: jest.fn(),
  };

  const mockStoreOwnerProfileRepository = {
    findByAccountId: jest.fn(),
  };

  const mockCourierProfileRepository = {
    findByAccountId: jest.fn(),
  };

  const accountId = generateObjectId();

  const mockAccount = {
    _id: accountId,
    fullName: 'Test User',
    phone: '+963991234567',
    role: 'customer',
    isVerified: true,
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: AccountRepository, useValue: mockAccountRepository },
        {
          provide: SecurityProfileRepository,
          useValue: mockSecurityProfileRepository,
        },
        {
          provide: CustomerProfileRepository,
          useValue: mockCustomerProfileRepository,
        },
        {
          provide: StoreOwnerProfileRepository,
          useValue: mockStoreOwnerProfileRepository,
        },
        {
          provide: CourierProfileRepository,
          useValue: mockCourierProfileRepository,
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('should create account successfully', async () => {
      mockAccountModel.findOne.mockResolvedValue(null);
      const savedAccount = {
        ...mockAccount,
        save: jest.fn().mockResolvedValue(mockAccount),
      };
      mockAccountRepository.create.mockResolvedValue(savedAccount);
      mockSecurityProfileRepository.create.mockResolvedValue({
        save: jest.fn(),
      });

      const result = await service.createAccount({
        fullName: 'Test User',
        phone: '+963991234567',
      });

      expect(result).toBeDefined();
    });

    it('should throw if account already exists', async () => {
      mockAccountModel.findOne.mockResolvedValue(mockAccount);

      await expect(
        service.createAccount({
          fullName: 'Test User',
          phone: '+963991234567',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('findByPhone', () => {
    it('should find account by phone', async () => {
      mockAccountRepository.findByPhone.mockResolvedValue(mockAccount);

      const result = await service.findByPhone('+963991234567');

      expect(result).toEqual(mockAccount);
    });
  });

  describe('findById', () => {
    it('should find account by id', async () => {
      mockAccountRepository.findById.mockResolvedValue(mockAccount);

      const result = await service.findById(accountId);

      expect(result).toEqual(mockAccount);
    });
  });

  describe('getAccountWithProfile', () => {
    it('should return account with customer profile', async () => {
      mockAccountRepository.findById.mockResolvedValue(mockAccount);
      const customerProfile = { points: 100 };
      mockCustomerProfileRepository.findByAccountId.mockResolvedValue(
        customerProfile,
      );

      const result = await service.getAccountWithProfile(accountId);

      expect(result.account).toEqual(mockAccount);
      expect(result.profile).toEqual(customerProfile);
    });

    it('should throw if account not found', async () => {
      mockAccountRepository.findById.mockResolvedValue(null);

      await expect(service.getAccountWithProfile(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return store owner profile', async () => {
      const storeOwnerAccount = { ...mockAccount, role: 'store_owner' };
      mockAccountRepository.findById.mockResolvedValue(storeOwnerAccount);
      const storeProfile = { storeName: 'Test Store' };
      mockStoreOwnerProfileRepository.findByAccountId.mockResolvedValue(
        storeProfile,
      );

      const result = await service.getAccountWithProfile(accountId);

      expect(result.profile).toEqual(storeProfile);
    });
  });
});
