import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AccountSecurityService } from './account-security.service';
import { AccountRepository } from '../repositories/account.repository';
import { SecurityProfileRepository } from '../repositories/security-profile.repository';
import { generateObjectId } from '../../testing';

jest.mock('bcrypt');

describe('AccountSecurityService', () => {
  let service: AccountSecurityService;
  let mockAccountRepo: any;
  let mockSecurityRepo: any;

  const accountId = new Types.ObjectId(generateObjectId());
  const mockAccount = {
    _id: accountId,
    phone: '+963991234567',
    passwordHash: 'hashed-password',
    save: jest.fn().mockResolvedValue(true),
  };

  const mockSecurityProfile = {
    _id: generateObjectId(),
    accountId,
    failedAttempts: 0,
    loginHistory: [],
    lockedUntil: undefined,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockAccountRepo = {
      findByPhone: jest.fn().mockResolvedValue(mockAccount),
    };

    mockSecurityRepo = {
      findByAccountId: jest.fn().mockResolvedValue(mockSecurityProfile),
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountSecurityService,
        { provide: AccountRepository, useValue: mockAccountRepo },
        { provide: SecurityProfileRepository, useValue: mockSecurityRepo },
      ],
    }).compile();

    service = module.get<AccountSecurityService>(AccountSecurityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockSecurityProfile.failedAttempts = 0;
    mockSecurityProfile.loginHistory = [];
    mockSecurityProfile.lockedUntil = undefined;
  });

  describe('setPassword', () => {
    it('should set password for account', async () => {
      await service.setPassword('+963991234567', 'newPassword');

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockAccount.save).toHaveBeenCalled();
    });

    it('should set email if provided', async () => {
      await service.setPassword(
        '+963991234567',
        'newPassword',
        'test@example.com',
      );

      expect(mockAccount.email).toBe('test@example.com');
    });

    it('should throw NotFoundException if account not found', async () => {
      mockAccountRepo.findByPhone.mockResolvedValue(null);

      await expect(
        service.setPassword('+963991234567', 'newPassword'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      const result = await service.validatePassword(
        mockAccount as any,
        'password',
      );

      expect(result).toBe(true);
    });

    it('should return false if no password hash', async () => {
      const accountWithoutHash = { ...mockAccount, passwordHash: undefined };

      const result = await service.validatePassword(
        accountWithoutHash as any,
        'password',
      );

      expect(result).toBe(false);
    });
  });

  describe('updatePassword', () => {
    it('should update password', async () => {
      await service.updatePassword('+963991234567', 'newPassword');

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(mockAccount.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if account not found', async () => {
      mockAccountRepo.findByPhone.mockResolvedValue(null);

      await expect(
        service.updatePassword('+963991234567', 'newPassword'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addLoginHistory', () => {
    it('should add successful login to history', async () => {
      await service.addLoginHistory(accountId, '127.0.0.1', 'Chrome', true);

      expect(mockSecurityProfile.loginHistory.length).toBe(1);
      expect(mockSecurityProfile.failedAttempts).toBe(0);
    });

    it('should increment failed attempts on failed login', async () => {
      await service.addLoginHistory(accountId, '127.0.0.1', 'Chrome', false);

      expect(mockSecurityProfile.failedAttempts).toBe(1);
    });

    it('should lock account after 5 failed attempts', async () => {
      mockSecurityProfile.failedAttempts = 4;

      await service.addLoginHistory(accountId, '127.0.0.1', 'Chrome', false);

      expect(mockSecurityProfile.lockedUntil).toBeDefined();
    });

    it('should handle missing security profile', async () => {
      mockSecurityRepo.findByAccountId.mockResolvedValue(null);

      await expect(
        service.addLoginHistory(accountId, '127.0.0.1', 'Chrome', true),
      ).resolves.not.toThrow();
    });
  });

  describe('isAccountLocked', () => {
    it('should return false if not locked', async () => {
      const result = await service.isAccountLocked(accountId);

      expect(result).toBe(false);
    });

    it('should return true if locked', async () => {
      mockSecurityProfile.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);

      const result = await service.isAccountLocked(accountId);

      expect(result).toBe(true);
    });

    it('should unlock if lock expired', async () => {
      mockSecurityProfile.lockedUntil = new Date(Date.now() - 1000);

      const result = await service.isAccountLocked(accountId);

      expect(result).toBe(false);
      expect(mockSecurityProfile.save).toHaveBeenCalled();
    });
  });
});
