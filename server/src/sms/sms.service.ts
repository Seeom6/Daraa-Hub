import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: twilio.Twilio;
  private twilioPhoneNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('twilio.accountSid') || '';
    const authToken = this.configService.get<string>('twilio.authToken') || '';
    this.twilioPhoneNumber = this.configService.get<string>(
      'twilio.phoneNumber',
    ) || '';

    // Only initialize Twilio if valid credentials are provided
    if (accountSid && authToken && accountSid.startsWith('AC') && authToken.length > 10) {
      try {
        this.twilioClient = twilio.default(accountSid, authToken);
        this.logger.log('Twilio client initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Twilio client:', error.message);
        this.logger.warn('SMS sending will be simulated.');
      }
    } else {
      this.logger.warn(
        'Twilio credentials not configured. SMS sending will be simulated.',
      );
    }
  }

  /**
   * Send OTP via SMS using Twilio
   * @param phoneNumber - Recipient phone number in international format
   * @param otp - The OTP code to send
   */
  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      const message = `Your Daraa verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;

      // If Twilio is not configured, simulate sending (for development)
      if (!this.twilioClient) {
        this.logger.log(
          `[SIMULATED SMS] To: ${phoneNumber}, Message: ${message}`,
        );
        return true;
      }

      // Send actual SMS via Twilio
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: phoneNumber,
      });

      this.logger.log(`SMS sent successfully to ${phoneNumber}. SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${phoneNumber}: ${error.message}`,
        error.stack,
      );
      
      // In development, don't fail if Twilio is not configured
      if (this.configService.get('nodeEnv') === 'development') {
        this.logger.warn('SMS sending failed, but continuing in development mode');
        return true;
      }
      
      return false;
    }
  }

  /**
   * Send password reset OTP via SMS
   * @param phoneNumber - Recipient phone number
   * @param otp - The OTP code to send
   */
  async sendPasswordResetOtp(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      const message = `Your Daraa password reset code is: ${otp}. This code will expire in 5 minutes. If you didn't request this, please ignore this message.`;

      if (!this.twilioClient) {
        this.logger.log(
          `[SIMULATED SMS] To: ${phoneNumber}, Message: ${message}`,
        );
        return true;
      }

      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: phoneNumber,
      });

      this.logger.log(`Password reset SMS sent to ${phoneNumber}. SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset SMS to ${phoneNumber}: ${error.message}`,
        error.stack,
      );
      
      if (this.configService.get('nodeEnv') === 'development') {
        this.logger.warn('SMS sending failed, but continuing in development mode');
        return true;
      }
      
      return false;
    }
  }
}

