import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { AccountProfileService } from './account-profile.service';
import { AccountRepository } from '../repositories/account.repository';
import { SecurityProfileRepository } from '../repositories/security-profile.repository';
import { CustomerProfileRepository } from '../repositories/customer-profile.repository';
import { StoreOwnerProfileRepository } from '../repositories/store-owner-profile.repository';
import { CourierProfileRepository } from '../repositories/courier-profile.repository';
import { StoreCategoryRepository } from '../../store-categories/repositories/store-category.repository';
import { generateObjectId } from '../../testing';

describe('AccountProfileService', () => {
  let service: AccountProfileService;
  let mockAccountRepo: any;
  let mockSecurityRepo: any;
  let mockCustomerRepo: any;
  let mockStoreOwnerRepo: any;
  let mockCourierRepo: any;
  let mockCategoryRepo: any;

  const accountId = new Types.ObjectId(generateObjectId());
  const mockAccount = {
    _id: accountId,
    phone: '+963991234567',
    fullName: 'Test User',
    role: 'customer',
    isVerified: false,
    save: jest.fn().mockResolvedValue(true),
  };

  const mockSecurityProfile = {
    _id: generateObjectId(),
    accountId,
    save: jest.fn(),
  };
  const mockCustomerProfile = {
    _id: generateObjectId(),
    accountId,
    save: jest.fn(),
  };
  const mockStoreOwnerProfile = {
    _id: generateObjectId(),
    accountId,
    save: jest.fn(),
  };

  beforeEach(async () => {
    mockAccountRepo = {
      findByPhone: jest.fn().mockResolvedValue(mockAccount),
      findById: jest.fn().mockResolvedValue(mockAccount),
    };

    mockSecurityRepo = {
      findByAccountId: jest.fn().mockResolvedValue(mockSecurityProfile),
      create: jest.fn().mockResolvedValue({
        save: jest.fn().mockResolvedValue(mockSecurityProfile),
      }),
    };

    mockCustomerRepo = {
      create: jest.fn().mockResolvedValue({
        save: jest.fn().mockResolvedValue(mockCustomerProfile),
      }),
    };

    mockStoreOwnerRepo = {
      findByAccountId: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({
        save: jest.fn().mockResolvedValue(mockStoreOwnerProfile),
      }),
    };

    mockCourierRepo = {
      findByAccountId: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockResolvedValue({ save: jest.fn().mockResolvedValue({}) }),
    };

    mockCategoryRepo = {
      findById: jest
        .fn()
        .mockResolvedValue({ _id: generateObjectId(), name: 'Electronics' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountProfileService,
        { provide: AccountRepository, useValue: mockAccountRepo },
        { provide: SecurityProfileRepository, useValue: mockSecurityRepo },
        { provide: CustomerProfileRepository, useValue: mockCustomerRepo },
        { provide: StoreOwnerProfileRepository, useValue: mockStoreOwnerRepo },
        { provide: CourierProfileRepository, useValue: mockCourierRepo },
        { provide: StoreCategoryRepository, useValue: mockCategoryRepo },
      ],
    }).compile();

    service = module.get<AccountProfileService>(AccountProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyPhoneAndCreateProfile', () => {
    it('should verify phone and create customer profile', async () => {
      const result = await service.verifyPhoneAndCreateProfile('+963991234567');

      expect(result.account).toBeDefined();
      expect(mockAccount.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if account not found', async () => {
      mockAccountRepo.findByPhone.mockResolvedValue(null);

      await expect(
        service.verifyPhoneAndCreateProfile('+963991234567'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create security profile if not exists', async () => {
      mockSecurityRepo.findByAccountId.mockResolvedValue(null);

      await service.verifyPhoneAndCreateProfile('+963991234567');

      expect(mockSecurityRepo.create).toHaveBeenCalled();
    });
  });

  describe('upgradeRole', () => {
    it('should upgrade to store_owner', async () => {
      await service.upgradeRole(accountId, 'store_owner');

      expect(mockStoreOwnerRepo.create).toHaveBeenCalled();
    });

    it('should upgrade to courier', async () => {
      await service.upgradeRole(accountId, 'courier');

      expect(mockCourierRepo.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if account not found', async () => {
      mockAccountRepo.findById.mockResolvedValue(null);

      await expect(
        service.upgradeRole(accountId, 'store_owner'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already same role', async () => {
      mockAccount.role = 'store_owner';

      await expect(
        service.upgradeRole(accountId, 'store_owner'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if store owner profile exists', async () => {
      mockAccount.role = 'customer';
      mockStoreOwnerRepo.findByAccountId.mockResolvedValue(
        mockStoreOwnerProfile,
      );

      await expect(
        service.upgradeRole(accountId, 'store_owner'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateStoreProfile', () => {
    it('should update store profile', async () => {
      mockStoreOwnerRepo.findByAccountId.mockResolvedValue(
        mockStoreOwnerProfile,
      );

      await service.updateStoreProfile(accountId.toString(), {
        storeName: 'New Store',
      });

      expect(mockStoreOwnerProfile.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockStoreOwnerRepo.findByAccountId.mockResolvedValue(null);

      await expect(
        service.updateStoreProfile(accountId.toString(), {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStoreProfile', () => {
    it('should return store profile', async () => {
      mockStoreOwnerRepo.findByAccountId.mockResolvedValue(
        mockStoreOwnerProfile,
      );

      const result = await service.getStoreProfile(accountId.toString());

      expect(result).toEqual(mockStoreOwnerProfile);
    });

    it('should throw NotFoundException if not found', async () => {
      mockStoreOwnerRepo.findByAccountId.mockResolvedValue(null);

      await expect(
        service.getStoreProfile(accountId.toString()),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStoreProfile - extended', () => {
    beforeEach(() => {
      mockAccount.role = 'customer';
      mockStoreOwnerRepo.findByAccountId.mockResolvedValue({
        ...mockStoreOwnerProfile,
        storeName: 'Old Store',
        storeDescription: 'Old Description',
        storeLogo: 'old-logo.png',
        storeBanner: 'old-banner.png',
        businessAddress: 'Old Address',
        businessPhone: '+963991111111',
        primaryCategory: null,
        storeCategories: [],
        save: jest.fn().mockResolvedValue(true),
      });
    });

    it('should update store name', async () => {
      const profile = await service.updateStoreProfile(accountId.toString(), {
        storeName: 'New Store Name',
      });

      expect(profile.storeName).toBe('New Store Name');
    });

    it('should update store description', async () => {
      const profile = await service.updateStoreProfile(accountId.toString(), {
        storeDescription: 'New Description',
      });

      expect(profile.storeDescription).toBe('New Description');
    });

    it('should update store logo', async () => {
      const profile = await service.updateStoreProfile(accountId.toString(), {
        storeLogo: 'new-logo.png',
      });

      expect(profile.storeLogo).toBe('new-logo.png');
    });

    it('should update store banner', async () => {
      const profile = await service.updateStoreProfile(accountId.toString(), {
        storeBanner: 'new-banner.png',
      });

      expect(profile.storeBanner).toBe('new-banner.png');
    });

    it('should update business address', async () => {
      const profile = await service.updateStoreProfile(accountId.toString(), {
        businessAddress: 'New Address',
      });

      expect(profile.businessAddress).toBe('New Address');
    });

    it('should update business phone', async () => {
      const profile = await service.updateStoreProfile(accountId.toString(), {
        businessPhone: '+963992222222',
      });

      expect(profile.businessPhone).toBe('+963992222222');
    });

    it('should update primary category', async () => {
      const categoryId = generateObjectId();
      mockCategoryRepo.findById.mockResolvedValue({
        _id: categoryId,
        name: 'Electronics',
      });

      const profile = await service.updateStoreProfile(accountId.toString(), {
        primaryCategoryId: categoryId,
      });

      expect(profile.primaryCategory).toBeDefined();
    });

    it('should throw NotFoundException if primary category not found', async () => {
      mockCategoryRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateStoreProfile(accountId.toString(), {
          primaryCategoryId: generateObjectId(),
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update store categories', async () => {
      const categoryId1 = generateObjectId();
      const categoryId2 = generateObjectId();
      mockCategoryRepo.findById.mockResolvedValue({
        _id: categoryId1,
        name: 'Category',
      });

      const profile = await service.updateStoreProfile(accountId.toString(), {
        storeCategoryIds: [categoryId1, categoryId2],
      });

      expect(profile.storeCategories).toHaveLength(2);
    });

    it('should throw NotFoundException if any store category not found', async () => {
      mockCategoryRepo.findById
        .mockResolvedValueOnce({ _id: generateObjectId(), name: 'Category' })
        .mockResolvedValueOnce(null);

      await expect(
        service.updateStoreProfile(accountId.toString(), {
          storeCategoryIds: [generateObjectId(), generateObjectId()],
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('upgradeRole - courier', () => {
    beforeEach(() => {
      mockAccount.role = 'customer';
    });

    it('should throw ConflictException if courier profile exists', async () => {
      mockCourierRepo.findByAccountId.mockResolvedValue({ _id: 'existing' });

      await expect(service.upgradeRole(accountId, 'courier')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
