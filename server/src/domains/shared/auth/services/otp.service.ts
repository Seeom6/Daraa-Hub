import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Otp, OtpDocument } from '../entities/otp.entity';
import { SECURITY_CONSTANTS } from '../../../../common/constants';

/**
 * Service for OTP generation, validation, and management
 */
@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);
  private readonly otpExpiryMinutes: number;
  private readonly otpMaxAttempts: number;
  private readonly otpLength: number;

  constructor(
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private configService: ConfigService,
  ) {
    this.otpExpiryMinutes =
      this.configService.get<number>('otp.expiryMinutes') ||
      SECURITY_CONSTANTS.OTP_EXPIRY_MINUTES;
    this.otpMaxAttempts =
      this.configService.get<number>('otp.maxAttempts') ||
      SECURITY_CONSTANTS.MAX_OTP_ATTEMPTS;
    this.otpLength =
      this.configService.get<number>('otp.length') ||
      SECURITY_CONSTANTS.OTP_LENGTH;
  }

  /**
   * Generate a random OTP
   */
  generateOtp(): string {
    const min = Math.pow(10, this.otpLength - 1);
    const max = Math.pow(10, this.otpLength) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
  }

  /**
   * Hash OTP before storing
   */
  async hashOtp(otp: string): Promise<string> {
    return bcrypt.hash(otp, 10);
  }

  /**
   * Verify OTP against hashed value
   */
  async verifyOtp(otp: string, hashedOtp: string): Promise<boolean> {
    return bcrypt.compare(otp, hashedOtp);
  }

  /**
   * Create and store OTP
   */
  async createOtp(
    phoneNumber: string,
    otp: string,
    type: string,
  ): Promise<void> {
    const hashedOtp = await this.hashOtp(otp);

    // Delete any existing OTPs for this phone number and type
    await this.otpModel.deleteMany({ phoneNumber, type });

    // Calculate expiry time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.otpExpiryMinutes);

    // Store OTP
    await this.otpModel.create({
      phoneNumber,
      otp: hashedOtp,
      expiresAt,
      type,
      attempts: 0,
      isUsed: false,
    });

    this.logger.log(`OTP created for ${phoneNumber} (type: ${type})`);
  }

  /**
   * Find OTP record
   */
  async findOtp(
    phoneNumber: string,
    type: string,
  ): Promise<OtpDocument | null> {
    return this.otpModel
      .findOne({
        phoneNumber,
        type,
        isUsed: false,
      })
      .sort({ createdAt: -1 });
  }

  /**
   * Increment OTP attempts
   */
  async incrementAttempts(otpId: string): Promise<void> {
    await this.otpModel.findByIdAndUpdate(otpId, {
      $inc: { attempts: 1 },
    });
  }

  /**
   * Mark OTP as used
   */
  async markAsUsed(otpId: string): Promise<void> {
    await this.otpModel.findByIdAndUpdate(otpId, {
      isUsed: true,
    });
  }

  /**
   * Delete OTP
   */
  async deleteOtp(phoneNumber: string, type: string): Promise<void> {
    await this.otpModel.deleteMany({ phoneNumber, type });
  }

  /**
   * Check if OTP is expired
   */
  isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Check if max attempts reached
   */
  isMaxAttemptsReached(attempts: number): boolean {
    return attempts >= this.otpMaxAttempts;
  }
}

