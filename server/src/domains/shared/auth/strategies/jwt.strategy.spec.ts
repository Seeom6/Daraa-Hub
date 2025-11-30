import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { JwtStrategy } from './jwt.strategy';
import { AccountService } from '../../accounts/services/account.service';
import { Types } from 'mongoose';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let accountService: jest.Mocked<AccountService>;

  const mockAccountService = {
    findById: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-secret-key'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: AccountService, useValue: mockAccountService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    accountService = module.get(AccountService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validate', () => {
    const mockPayload = {
      sub: new Types.ObjectId().toString(),
      phone: '+963991234567',
      role: 'customer',
    };

    it('should return user data when account is found and active', async () => {
      const mockAccount = {
        _id: mockPayload.sub,
        isActive: true,
        roleProfileId: new Types.ObjectId(),
      };
      mockAccountService.findById.mockResolvedValue(mockAccount);

      const result = await strategy.validate(mockPayload);

      expect(result).toEqual({
        sub: mockPayload.sub,
        userId: mockPayload.sub,
        phone: mockPayload.phone,
        role: mockPayload.role,
        profileId: mockAccount.roleProfileId.toString(),
      });
      expect(accountService.findById).toHaveBeenCalledWith(mockPayload.sub);
    });

    it('should return null profileId when roleProfileId is not set', async () => {
      const mockAccount = {
        _id: mockPayload.sub,
        isActive: true,
        roleProfileId: null,
      };
      mockAccountService.findById.mockResolvedValue(mockAccount);

      const result = await strategy.validate(mockPayload);

      expect(result.profileId).toBeNull();
    });

    it('should throw UnauthorizedException when account is not found', async () => {
      mockAccountService.findById.mockResolvedValue(null);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        'Account not found or inactive',
      );
    });

    it('should throw UnauthorizedException when account is inactive', async () => {
      const mockAccount = {
        _id: mockPayload.sub,
        isActive: false,
        roleProfileId: new Types.ObjectId(),
      };
      mockAccountService.findById.mockResolvedValue(mockAccount);

      await expect(strategy.validate(mockPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
