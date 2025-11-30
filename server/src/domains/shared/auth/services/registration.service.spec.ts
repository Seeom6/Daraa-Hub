import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { RegistrationService } from './registration.service';
import { AccountService } from '../../accounts/services/account.service';
import { AccountProfileService } from '../../accounts/services/account-profile.service';
import { AccountSecurityService } from '../../accounts/services/account-security.service';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';
import { Otp } from '../entities/otp.entity';
import { generateObjectId } from '../../testing';

describe('RegistrationService', () => {
  let service: RegistrationService;
  let mockOtpModel: any;
  let mockAccountService: any;
  let mockAccountProfileService: any;
  let mockAccountSecurityService: any;
  let mockSmsService: any;
  let mockOtpService: any;
  let mockTokenService: any;

  const mockAccount = {
    _id: generateObjectId(),
    phone: '+963991234567',
    role: 'customer',
  };
  const mockOtpRecord = {
    _id: generateObjectId(),
    phoneNumber: '+963991234567',
    otp: '123456',
    expiresAt: new Date(Date.now() + 300000),
    attempts: 0,
    isUsed: false,
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockOtpModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ sort: jest.fn().mockResolvedValue(mockOtpRecord) }),
    };

    mockAccountService = {
      createAccount: jest.fn().mockResolvedValue(mockAccount),
    };

    mockAccountProfileService = {
      verifyPhoneAndCreateProfile: jest.fn().mockResolvedValue(mockAccount),
    };

    mockAccountSecurityService = {
      setPassword: jest.fn().mockResolvedValue(mockAccount),
    };

    mockSmsService = {
      sendOtp: jest.fn().mockResolvedValue(true),
    };

    mockOtpService = {
      generateOtp: jest.fn().mockReturnValue('123456'),
      createOtp: jest.fn().mockResolvedValue(mockOtpRecord),
      findOtp: jest.fn().mockResolvedValue(mockOtpRecord),
      isExpired: jest.fn().mockReturnValue(false),
      isMaxAttemptsReached: jest.fn().mockReturnValue(false),
      verifyOtp: jest.fn().mockResolvedValue(true),
      incrementAttempts: jest.fn().mockResolvedValue(undefined),
      markAsUsed: jest.fn().mockResolvedValue(undefined),
      deleteOtp: jest.fn().mockResolvedValue(undefined),
    };

    mockTokenService = {
      generateAccessToken: jest.fn().mockReturnValue('access-token'),
      generateRefreshToken: jest.fn().mockReturnValue('refresh-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: getModelToken(Otp.name), useValue: mockOtpModel },
        { provide: AccountService, useValue: mockAccountService },
        { provide: AccountProfileService, useValue: mockAccountProfileService },
        {
          provide: AccountSecurityService,
          useValue: mockAccountSecurityService,
        },
        { provide: 'SMS_SERVICE', useValue: mockSmsService },
        { provide: OtpService, useValue: mockOtpService },
        { provide: TokenService, useValue: mockTokenService },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerStep1', () => {
    it('should create account and send OTP', async () => {
      const result = await service.registerStep1({
        phoneNumber: '+963991234567',
        fullName: 'Test User',
      });

      expect(result.message).toBeDefined();
      expect(mockAccountService.createAccount).toHaveBeenCalled();
      expect(mockSmsService.sendOtp).toHaveBeenCalled();
    });

    it('should throw if SMS fails', async () => {
      mockSmsService.sendOtp.mockResolvedValue(false);

      await expect(
        service.registerStep1({
          phoneNumber: '+963991234567',
          fullName: 'Test',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      const result = await service.verifyOtp({
        phoneNumber: '+963991234567',
        otp: '123456',
      });

      expect(result.verified).toBe(true);
      expect(
        mockAccountProfileService.verifyPhoneAndCreateProfile,
      ).toHaveBeenCalled();
    });

    it('should throw if no OTP found', async () => {
      mockOtpService.findOtp.mockResolvedValue(null);

      await expect(
        service.verifyOtp({ phoneNumber: '+963991234567', otp: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if OTP expired', async () => {
      mockOtpService.isExpired.mockReturnValue(true);

      await expect(
        service.verifyOtp({ phoneNumber: '+963991234567', otp: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if max attempts reached', async () => {
      mockOtpService.isMaxAttemptsReached.mockReturnValue(true);

      await expect(
        service.verifyOtp({ phoneNumber: '+963991234567', otp: '123456' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if OTP invalid', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(false);

      await expect(
        service.verifyOtp({ phoneNumber: '+963991234567', otp: 'wrong' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeProfile', () => {
    it('should complete profile and return tokens', async () => {
      mockOtpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({ ...mockOtpRecord, isUsed: true }),
      });

      const result = await service.completeProfile({
        phoneNumber: '+963991234567',
        password: 'Pass@123',
      });

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw if OTP not verified', async () => {
      mockOtpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.completeProfile({
          phoneNumber: '+963991234567',
          password: 'Pass@123',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if verification expired', async () => {
      const oldDate = new Date();
      oldDate.setMinutes(oldDate.getMinutes() - 15);
      mockOtpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({
          ...mockOtpRecord,
          isUsed: true,
          updatedAt: oldDate,
        }),
      });

      await expect(
        service.completeProfile({
          phoneNumber: '+963991234567',
          password: 'Pass@123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
