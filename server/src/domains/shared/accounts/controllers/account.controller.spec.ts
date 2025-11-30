import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { AccountService } from '../services/account.service';
import { AccountProfileService } from '../services/account-profile.service';
import { generateObjectId } from '../../testing';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';

describe('AccountController', () => {
  let controller: AccountController;
  let accountService: jest.Mocked<AccountService>;
  let profileService: jest.Mocked<AccountProfileService>;

  const mockAccountService = {
    getAccountWithProfile: jest.fn(),
  };

  const mockProfileService = {
    upgradeRole: jest.fn(),
    updateStoreProfile: jest.fn(),
    getStoreProfile: jest.fn(),
  };

  const accountId = generateObjectId();
  const mockRequest = { user: { userId: accountId, sub: accountId } };

  const mockAccount = {
    _id: accountId,
    fullName: 'Test User',
    phone: '+963991234567',
    role: 'customer',
    isVerified: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        { provide: AccountService, useValue: mockAccountService },
        { provide: AccountProfileService, useValue: mockProfileService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AccountController>(AccountController);
    accountService = module.get(AccountService);
    profileService = module.get(AccountProfileService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const profileData = { account: mockAccount, profile: { points: 100 } };
      mockAccountService.getAccountWithProfile.mockResolvedValue(profileData);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(profileData);
      expect(mockAccountService.getAccountWithProfile).toHaveBeenCalledWith(
        accountId,
      );
    });
  });

  describe('upgradeRole', () => {
    it('should upgrade account role', async () => {
      const upgradeDto = { role: 'store_owner' };
      mockProfileService.upgradeRole.mockResolvedValue({
        ...mockAccount,
        role: 'store_owner',
      });

      const result = await controller.upgradeRole(
        mockRequest,
        upgradeDto as any,
      );

      expect(result.message).toBe('Account role upgraded successfully');
      expect(result.role).toBe('store_owner');
      expect(result.verificationStatus).toBe('pending');
    });
  });

  describe('updateStoreProfile', () => {
    it('should update store profile', async () => {
      const updateDto = { storeName: 'New Store Name' };
      const mockProfile = {
        storeName: 'New Store Name',
        storeDescription: 'Test',
      };
      mockProfileService.updateStoreProfile.mockResolvedValue(mockProfile);

      const result = await controller.updateStoreProfile(
        { sub: accountId },
        updateDto as any,
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });
  });

  describe('getStoreProfile', () => {
    it('should return store profile', async () => {
      const mockProfile = { storeName: 'Test Store', storeDescription: 'Test' };
      mockProfileService.getStoreProfile.mockResolvedValue(mockProfile);

      const result = await controller.getStoreProfile({ sub: accountId });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProfile);
    });
  });
});
