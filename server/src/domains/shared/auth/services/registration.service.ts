import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountService } from '../../accounts/services/account.service';
import { AccountProfileService } from '../../accounts/services/account-profile.service';
import { AccountSecurityService } from '../../accounts/services/account-security.service';
import type { ISmsService } from '../../../../infrastructure/sms/sms.interface';
import { Otp, OtpDocument } from '../entities/otp.entity';
import { RegisterStep1Dto } from '../dto/register-step1.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { CompleteProfileDto } from '../dto/complete-profile.dto';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';

/**
 * Service responsible for user registration
 * Handles: Step 1 (send OTP), Step 2 (verify OTP), Step 3 (complete profile)
 */
@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private accountService: AccountService,
    private accountProfileService: AccountProfileService,
    private accountSecurityService: AccountSecurityService,
    @Inject('SMS_SERVICE') private smsService: ISmsService,
    private otpService: OtpService,
    private tokenService: TokenService,
  ) {}

  /**
   * Step 1: Register - Create account and send OTP
   */
  async registerStep1(dto: RegisterStep1Dto): Promise<{ message: string }> {
    const { phoneNumber, fullName } = dto;

    // Create account with security profile
    await this.accountService.createAccount({
      fullName,
      phone: phoneNumber,
    });

    // Generate and store OTP
    const otp = this.otpService.generateOtp();
    this.logger.log(`Generated OTP for ${phoneNumber}: ${otp}`);
    await this.otpService.createOtp(phoneNumber, otp, 'registration');

    // Send OTP via SMS
    const smsSent = await this.smsService.sendOtp(phoneNumber, otp);

    if (!smsSent) {
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }

    return {
      message: 'تم إرسال رمز التحقق إلى رقم هاتفك.',
    };
  }

  /**
   * Step 2: Verify OTP and create customer profile
   */
  async verifyOtp(
    dto: VerifyOtpDto,
  ): Promise<{ message: string; verified: boolean; next: string }> {
    const { phoneNumber, otp } = dto;

    // Find OTP record
    const otpRecord = await this.otpService.findOtp(
      phoneNumber,
      'registration',
    );

    if (!otpRecord) {
      throw new BadRequestException('No OTP found for this phone number');
    }

    // Check if OTP has expired
    if (this.otpService.isExpired(otpRecord.expiresAt)) {
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    // Check if max attempts exceeded
    if (this.otpService.isMaxAttemptsReached(otpRecord.attempts)) {
      throw new BadRequestException(
        'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      );
    }

    // Verify OTP
    const isValid = await this.otpService.verifyOtp(otp, otpRecord.otp);

    if (!isValid) {
      // Increment attempts
      await this.otpService.incrementAttempts(
        (otpRecord._id as any).toString(),
      );

      throw new BadRequestException(
        `Invalid OTP. ${3 - (otpRecord.attempts + 1)} attempt(s) remaining.`,
      );
    }

    // Mark OTP as used
    await this.otpService.markAsUsed((otpRecord._id as any).toString());

    // Verify phone and create customer profile
    await this.accountProfileService.verifyPhoneAndCreateProfile(phoneNumber);

    return {
      message: 'تم التحقق من رقم الهاتف بنجاح.',
      verified: true,
      next: '/auth/set-password',
    };
  }

  /**
   * Step 3: Set Password and Complete Registration
   */
  async completeProfile(dto: CompleteProfileDto): Promise<{
    accessToken: string;
    refreshToken: string;
    role: string;
    message: string;
  }> {
    const { phoneNumber, email, password } = dto;

    // Verify that OTP was verified for this phone number
    const verifiedOtp = await this.otpModel
      .findOne({
        phoneNumber,
        type: 'registration',
        isUsed: true,
      })
      .sort({ createdAt: -1 });

    if (!verifiedOtp) {
      throw new BadRequestException(
        'Phone number not verified. Please complete OTP verification first.',
      );
    }

    // Check if verification was recent (within last 10 minutes)
    const tenMinutesAgo = new Date();
    tenMinutesAgo.setMinutes(tenMinutesAgo.getMinutes() - 10);

    if (verifiedOtp.updatedAt < tenMinutesAgo) {
      throw new BadRequestException(
        'OTP verification expired. Please start registration again.',
      );
    }

    // Set password for account
    const account = await this.accountSecurityService.setPassword(
      phoneNumber,
      password,
      email,
    );

    // Generate JWT tokens
    const payload = {
      sub: (account._id as any).toString(),
      phone: account.phone,
      role: account.role,
    };
    const accessToken = this.tokenService.generateAccessToken(payload);
    const refreshToken = this.tokenService.generateRefreshToken(payload);

    // Clean up used OTP
    await this.otpService.deleteOtp(phoneNumber, 'registration');

    return {
      accessToken,
      refreshToken,
      role: account.role,
      message: 'تم إنشاء الحساب بنجاح.',
    };
  }
}
