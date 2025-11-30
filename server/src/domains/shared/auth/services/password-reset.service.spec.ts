import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { PasswordResetService } from './password-reset.service';
import { AccountService } from '../../accounts/services/account.service';
import { AccountSecurityService } from '../../accounts/services/account-security.service';
import { OtpService } from './otp.service';
import { Otp } from '../entities/otp.entity';
import { generateObjectId } from '../../testing';

describe('PasswordResetService', () => {
  let service: PasswordResetService;
  let mockOtpModel: any;
  let mockAccountService: any;
  let mockAccountSecurityService: any;
  let mockSmsService: any;
  let mockOtpService: any;

  const mockAccount = { _id: generateObjectId(), phone: '+963991234567' };
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
      findByPhone: jest.fn().mockResolvedValue(mockAccount),
    };

    mockAccountSecurityService = {
      updatePassword: jest.fn().mockResolvedValue(mockAccount),
    };

    mockSmsService = {
      sendPasswordResetOtp: jest.fn().mockResolvedValue(true),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordResetService,
        { provide: getModelToken(Otp.name), useValue: mockOtpModel },
        { provide: AccountService, useValue: mockAccountService },
        {
          provide: AccountSecurityService,
          useValue: mockAccountSecurityService,
        },
        { provide: 'SMS_SERVICE', useValue: mockSmsService },
        { provide: OtpService, useValue: mockOtpService },
      ],
    }).compile();

    service = module.get<PasswordResetService>(PasswordResetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('forgotPassword', () => {
    it('should send OTP for existing account', async () => {
      const result = await service.forgotPassword({
        phoneNumber: '+963991234567',
      });

      expect(result.message).toContain('If this phone number is registered');
      expect(mockOtpService.createOtp).toHaveBeenCalled();
      expect(mockSmsService.sendPasswordResetOtp).toHaveBeenCalled();
    });

    it('should return same message for non-existing account', async () => {
      mockAccountService.findByPhone.mockResolvedValue(null);

      const result = await service.forgotPassword({
        phoneNumber: '+963991234567',
      });

      expect(result.message).toContain('If this phone number is registered');
      expect(mockOtpService.createOtp).not.toHaveBeenCalled();
    });
  });

  describe('verifyForgotPasswordOtp', () => {
    it('should verify OTP successfully', async () => {
      const result = await service.verifyForgotPasswordOtp({
        phoneNumber: '+963991234567',
        otp: '123456',
      });

      expect(result.verified).toBe(true);
      expect(mockOtpService.markAsUsed).toHaveBeenCalled();
    });

    it('should throw if no OTP found', async () => {
      mockOtpService.findOtp.mockResolvedValue(null);

      await expect(
        service.verifyForgotPasswordOtp({
          phoneNumber: '+963991234567',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if OTP expired', async () => {
      mockOtpService.isExpired.mockReturnValue(true);

      await expect(
        service.verifyForgotPasswordOtp({
          phoneNumber: '+963991234567',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if max attempts reached', async () => {
      mockOtpService.isMaxAttemptsReached.mockReturnValue(true);

      await expect(
        service.verifyForgotPasswordOtp({
          phoneNumber: '+963991234567',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if OTP invalid', async () => {
      mockOtpService.verifyOtp.mockResolvedValue(false);

      await expect(
        service.verifyForgotPasswordOtp({
          phoneNumber: '+963991234567',
          otp: 'wrong',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockOtpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue({
          ...mockOtpRecord,
          isUsed: true,
          updatedAt: new Date(),
        }),
      });

      const result = await service.resetPassword({
        phoneNumber: '+963991234567',
        password: 'NewPass@123',
      });

      expect(result.message).toContain('Password reset successfully');
      expect(mockAccountSecurityService.updatePassword).toHaveBeenCalled();
    });

    it('should throw if OTP not verified', async () => {
      mockOtpModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.resetPassword({
          phoneNumber: '+963991234567',
          password: 'NewPass@123',
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
        service.resetPassword({
          phoneNumber: '+963991234567',
          password: 'NewPass@123',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
