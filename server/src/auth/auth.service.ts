import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AccountService } from '../account/account.service';
import { SmsService } from '../sms/sms.service';
import { Otp, OtpDocument } from './schemas/otp.schema';
import { RegisterStep1Dto } from './dto/register-step1.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpExpiryMinutes: number;
  private readonly otpMaxAttempts: number;
  private readonly otpLength: number;

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private accountService: AccountService,
    private smsService: SmsService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    this.otpExpiryMinutes = this.configService.get<number>('otp.expiryMinutes') || 5;
    this.otpMaxAttempts = this.configService.get<number>('otp.maxAttempts') || 3;
    this.otpLength = this.configService.get<number>('otp.length') || 6;
  }

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

    // Generate OTP
    const otp = this.generateOtp();
    this.logger.log(`Generated OTP for ${phoneNumber}: ${otp}`);

    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Delete any existing OTPs for this phone number
    await this.otpModel.deleteMany({ phoneNumber, type: 'registration' });

    // Store OTP in database
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.otpExpiryMinutes);

    await this.otpModel.create({
      phoneNumber,
      otp: hashedOtp,
      expiresAt,
      type: 'registration',
      attempts: 0,
      isUsed: false,
    });

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
  async verifyOtp(dto: VerifyOtpDto): Promise<{ message: string; verified: boolean; next: string }> {
    const { phoneNumber, otp } = dto;

    // Find OTP record
    const otpRecord = await this.otpModel.findOne({
      phoneNumber,
      type: 'registration',
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new BadRequestException('No OTP found for this phone number');
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= this.otpMaxAttempts) {
      throw new BadRequestException(
        'Maximum OTP verification attempts exceeded. Please request a new OTP.',
      );
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = this.otpMaxAttempts - otpRecord.attempts;
      throw new BadRequestException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
      );
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Verify phone and create customer profile
    await this.accountService.verifyPhoneAndCreateProfile(phoneNumber);

    return {
      message: 'تم التحقق من رقم الهاتف بنجاح.',
      verified: true,
      next: '/auth/set-password',
    };
  }

  /**
   * Step 3: Set Password and Complete Registration
   */
  async completeProfile(dto: CompleteProfileDto): Promise<{ accessToken: string; refreshToken: string; role: string; message: string }> {
    const { phoneNumber, email, password } = dto;

    // Verify that OTP was verified for this phone number
    const verifiedOtp = await this.otpModel.findOne({
      phoneNumber,
      type: 'registration',
      isUsed: true,
    }).sort({ createdAt: -1 });

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
    const account = await this.accountService.setPassword(phoneNumber, password, email);

    // Generate JWT tokens
    const payload = {
      sub: (account._id as any).toString(),
      phone: account.phone,
      role: account.role,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    // Clean up used OTP
    await this.otpModel.deleteMany({ phoneNumber, type: 'registration' });

    return {
      accessToken,
      refreshToken,
      role: account.role,
      message: 'تم إنشاء الحساب بنجاح.',
    };
  }

  /**
   * Login
   */
  async login(dto: LoginDto, ip: string, device: string): Promise<{ accessToken: string; refreshToken: string; role: string }> {
    const { phoneNumber, password } = dto;

    // Find account
    const account = await this.accountService.findByPhone(phoneNumber);
    if (!account) {
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Check if account is locked
    const isLocked = await this.accountService.isAccountLocked(account._id as any);
    if (isLocked) {
      throw new UnauthorizedException('Account is temporarily locked due to multiple failed login attempts. Please try again later.');
    }

    // Validate password
    const isPasswordValid = await this.accountService.validatePassword(account, password);
    if (!isPasswordValid) {
      // Record failed login attempt
      await this.accountService.addLoginHistory(account._id as any, ip, device, false);
      throw new UnauthorizedException('Invalid phone number or password');
    }

    // Record successful login
    await this.accountService.addLoginHistory(account._id as any, ip, device, true);

    // Generate JWT tokens
    const payload = {
      sub: (account._id as any).toString(),
      phone: account.phone,
      role: account.role,
    };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '30d' });

    return {
      accessToken,
      refreshToken,
      role: account.role,
    };
  }

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
        message: 'If this phone number is registered, you will receive an OTP shortly.',
      };
    }

    // Generate OTP
    const otp = this.generateOtp();
    this.logger.log(`Generated password reset OTP for ${phoneNumber}: ${otp}`);

    // Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Delete any existing password reset OTPs
    await this.otpModel.deleteMany({ phoneNumber, type: 'forgot-password' });

    // Store OTP
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.otpExpiryMinutes);

    await this.otpModel.create({
      phoneNumber,
      otp: hashedOtp,
      expiresAt,
      type: 'forgot-password',
      attempts: 0,
      isUsed: false,
    });

    // Send OTP via SMS
    await this.smsService.sendPasswordResetOtp(phoneNumber, otp);

    return {
      message: 'If this phone number is registered, you will receive an OTP shortly.',
    };
  }

  /**
   * Verify Forgot Password OTP
   */
  async verifyForgotPasswordOtp(dto: VerifyOtpDto): Promise<{ message: string; verified: boolean }> {
    const { phoneNumber, otp } = dto;

    // Find OTP record
    const otpRecord = await this.otpModel.findOne({
      phoneNumber,
      type: 'forgot-password',
      isUsed: false,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      throw new BadRequestException('No OTP found for password reset');
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    // Check attempts
    if (otpRecord.attempts >= this.otpMaxAttempts) {
      throw new BadRequestException(
        'Maximum attempts exceeded. Please request a new OTP.',
      );
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = this.otpMaxAttempts - otpRecord.attempts;
      throw new BadRequestException(
        `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
      );
    }

    // Mark as used
    otpRecord.isUsed = true;
    await otpRecord.save();

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
    const verifiedOtp = await this.otpModel.findOne({
      phoneNumber,
      type: 'forgot-password',
      isUsed: true,
    }).sort({ createdAt: -1 });

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
    await this.accountService.updatePassword(phoneNumber, password);

    // Clean up OTPs
    await this.otpModel.deleteMany({ phoneNumber, type: 'forgot-password' });

    return {
      message: 'Password reset successfully. You can now login with your new password.',
    };
  }

  /**
   * Generate random OTP
   */
  private generateOtp(): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < this.otpLength; i++) {
      otp += digits[Math.floor(Math.random() * 10)];
    }
    return otp;
  }
}

