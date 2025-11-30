import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountService } from '../../accounts/services/account.service';
import { AccountSecurityService } from '../../accounts/services/account-security.service';
import type { ISmsService } from '../../../../infrastructure/sms/sms.interface';
import { Otp, OtpDocument } from '../entities/otp.entity';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { OtpService } from './otp.service';

/**
 * Service responsible for password reset flow
 * Handles: forgot password, verify OTP, reset password
 */
@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private accountService: AccountService,
    private accountSecurityService: AccountSecurityService,
    @Inject('SMS_SERVICE') private smsService: ISmsService,
    private otpService: OtpService,
  ) {}

  /**
   * Forgot Password - Step 1: Send OTP
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    const { phoneNumber } = dto;

    // Check if account exists
    const account = await this.accountService.findByPhone(phoneNumber);
    if (!account) {
      // Don't reveal if account exists or not for security
      return {
        message:
          'If this phone number is registered, you will receive an OTP shortly.',
      };
    }

    // Generate and store OTP
    const otp = this.otpService.generateOtp();
    this.logger.log(`Generated password reset OTP for ${phoneNumber}: ${otp}`);
    await this.otpService.createOtp(phoneNumber, otp, 'forgot-password');

    // Send OTP via SMS
    await this.smsService.sendPasswordResetOtp(phoneNumber, otp);

    return {
      message:
        'If this phone number is registered, you will receive an OTP shortly.',
    };
  }

  /**
   * Verify Forgot Password OTP
   */
  async verifyForgotPasswordOtp(
    dto: VerifyOtpDto,
  ): Promise<{ message: string; verified: boolean }> {
    const { phoneNumber, otp } = dto;

    // Find OTP record
    const otpRecord = await this.otpService.findOtp(
      phoneNumber,
      'forgot-password',
    );

    if (!otpRecord) {
      throw new BadRequestException('No OTP found for password reset');
    }

    // Check expiry
    if (this.otpService.isExpired(otpRecord.expiresAt)) {
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    // Check attempts
    if (this.otpService.isMaxAttemptsReached(otpRecord.attempts)) {
      throw new BadRequestException(
        'Maximum attempts exceeded. Please request a new OTP.',
      );
    }

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(otp, otpRecord.otp);

    if (!isValid) {
      await this.otpService.incrementAttempts(
        (otpRecord._id as any).toString(),
      );

      throw new BadRequestException(
        `Invalid OTP. ${3 - (otpRecord.attempts + 1)} attempt(s) remaining.`,
      );
    }

    // Mark as used
    await this.otpService.markAsUsed((otpRecord._id as any).toString());

    return {
      message: 'OTP verified successfully. You can now reset your password.',
      verified: true,
    };
  }

  /**
   * Reset Password
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const { phoneNumber, password } = dto;

    // Verify that OTP was verified
    const verifiedOtp = await this.otpModel
      .findOne({
        phoneNumber,
        type: 'forgot-password',
        isUsed: true,
      })
      .sort({ createdAt: -1 });

    if (!verifiedOtp) {
      throw new BadRequestException(
        'Please verify OTP before resetting password.',
      );
    }

    // Check if verification was recent
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    if (verifiedOtp.updatedAt < tenMinutesAgo) {
      throw new BadRequestException(
        'OTP verification expired. Please start the process again.',
      );
    }

    // Update password
    await this.accountSecurityService.updatePassword(phoneNumber, password);

    // Clean up OTPs
    await this.otpService.deleteOtp(phoneNumber, 'forgot-password');

    return {
      message:
        'Password reset successfully. You can now login with your new password.',
    };
  }
}
