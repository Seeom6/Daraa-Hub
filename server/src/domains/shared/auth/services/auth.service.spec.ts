import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AccountService } from '../../accounts/services/account.service';
import { AccountSecurityService } from '../../accounts/services/account-security.service';
import { TokenService } from './token.service';
import { RegistrationService } from './registration.service';
import { PasswordResetService } from './password-reset.service';
import { generateObjectId } from '../../testing';

describe('AuthService', () => {
  let service: AuthService;
  let accountService: jest.Mocked<AccountService>;
  let accountSecurityService: jest.Mocked<AccountSecurityService>;
  let tokenService: jest.Mocked<TokenService>;
  let registrationService: jest.Mocked<RegistrationService>;
  let passwordResetService: jest.Mocked<PasswordResetService>;

  const mockAccountService = {
    findByPhone: jest.fn(),
  };

  const mockAccountSecurityService = {
    isAccountLocked: jest.fn(),
    validatePassword: jest.fn(),
    addLoginHistory: jest.fn(),
  };

  const mockTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn(),
  };

  const mockRegistrationService = {
    registerStep1: jest.fn(),
    verifyOtp: jest.fn(),
    completeProfile: jest.fn(),
  };

  const mockPasswordResetService = {
    forgotPassword: jest.fn(),
    verifyForgotPasswordOtp: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AccountService, useValue: mockAccountService },
        {
          provide: AccountSecurityService,
          useValue: mockAccountSecurityService,
        },
        { provide: TokenService, useValue: mockTokenService },
        { provide: RegistrationService, useValue: mockRegistrationService },
        { provide: PasswordResetService, useValue: mockPasswordResetService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    accountService = module.get(AccountService);
    accountSecurityService = module.get(AccountSecurityService);
    tokenService = module.get(TokenService);
    registrationService = module.get(RegistrationService);
    passwordResetService = module.get(PasswordResetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStep1', () => {
    it('should delegate to registrationService', async () => {
      const dto = { phoneNumber: '+963991234567', role: 'customer' };
      const expected = { message: 'OTP sent' };
      mockRegistrationService.registerStep1.mockResolvedValue(expected);

      const result = await service.registerStep1(dto as any);

      expect(result).toEqual(expected);
      expect(mockRegistrationService.registerStep1).toHaveBeenCalledWith(dto);
    });
  });

  describe('verifyOtp', () => {
    it('should delegate to registrationService', async () => {
      const dto = { phoneNumber: '+963991234567', otp: '123456' };
      const expected = {
        message: 'OTP verified',
        verified: true,
        next: 'complete-profile',
      };
      mockRegistrationService.verifyOtp.mockResolvedValue(expected);

      const result = await service.verifyOtp(dto as any);

      expect(result).toEqual(expected);
    });
  });

  describe('login', () => {
    const loginDto = { phoneNumber: '+963991234567', password: 'Password123' };
    const mockAccount = {
      _id: generateObjectId(),
      phone: '+963991234567',
      role: 'customer',
    };

    it('should login successfully', async () => {
      mockAccountService.findByPhone.mockResolvedValue(mockAccount);
      mockAccountSecurityService.isAccountLocked.mockResolvedValue(false);
      mockAccountSecurityService.validatePassword.mockResolvedValue(true);
      mockTokenService.generateAccessToken.mockReturnValue('access-token');
      mockTokenService.generateRefreshToken.mockReturnValue('refresh-token');

      const result = await service.login(
        loginDto as any,
        '127.0.0.1',
        'test-agent',
      );

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.role).toBe('customer');
    });

    it('should throw if account not found', async () => {
      mockAccountService.findByPhone.mockResolvedValue(null);

      await expect(
        service.login(loginDto as any, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if account is locked', async () => {
      mockAccountService.findByPhone.mockResolvedValue(mockAccount);
      mockAccountSecurityService.isAccountLocked.mockResolvedValue(true);

      await expect(
        service.login(loginDto as any, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw if password is invalid', async () => {
      mockAccountService.findByPhone.mockResolvedValue(mockAccount);
      mockAccountSecurityService.isAccountLocked.mockResolvedValue(false);
      mockAccountSecurityService.validatePassword.mockResolvedValue(false);

      await expect(
        service.login(loginDto as any, '127.0.0.1', 'test-agent'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const payload = {
        sub: 'user-id',
        phone: '+963991234567',
        role: 'customer',
      };
      mockTokenService.verifyRefreshToken.mockReturnValue(payload);
      mockTokenService.generateAccessToken.mockReturnValue('new-access-token');

      const result = await service.refreshToken('valid-refresh-token');

      expect(result.accessToken).toBe('new-access-token');
    });

    it('should throw if refresh token is invalid', async () => {
      mockTokenService.verifyRefreshToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('forgotPassword', () => {
    it('should delegate to passwordResetService', async () => {
      const dto = { phoneNumber: '+963991234567' };
      const expected = { message: 'OTP sent' };
      mockPasswordResetService.forgotPassword.mockResolvedValue(expected);

      const result = await service.forgotPassword(dto as any);

      expect(result).toEqual(expected);
    });
  });

  describe('resetPassword', () => {
    it('should delegate to passwordResetService', async () => {
      const dto = { resetToken: 'token', newPassword: 'NewPassword123' };
      const expected = { message: 'Password reset successful' };
      mockPasswordResetService.resetPassword.mockResolvedValue(expected);

      const result = await service.resetPassword(dto as any);

      expect(result).toEqual(expected);
    });
  });
});
