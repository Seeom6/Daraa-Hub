import { Injectable, Logger } from '@nestjs/common';
import { ISmsService } from '../sms.interface';

/**
 * Mock SMS provider for development/testing
 * Logs messages instead of sending actual SMS
 */
@Injectable()
export class MockSmsProvider implements ISmsService {
  private readonly logger = new Logger(MockSmsProvider.name);

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your Daraa verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;
    this.logger.log(`[MOCK SMS] To: ${phoneNumber}, Message: ${message}`);
    this.logger.log(`Generated OTP for ${phoneNumber}: ${otp}`);
    return true;
  }

  async sendPasswordResetOtp(
    phoneNumber: string,
    otp: string,
  ): Promise<boolean> {
    const message = `Your Daraa password reset code is: ${otp}. This code will expire in 5 minutes. If you didn't request this, please ignore this message.`;
    this.logger.log(`[MOCK SMS] To: ${phoneNumber}, Message: ${message}`);
    this.logger.log(`Generated OTP for ${phoneNumber}: ${otp}`);
    return true;
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    this.logger.log(`[MOCK SMS] To: ${phoneNumber}, Message: ${message}`);
    return true;
  }
}
