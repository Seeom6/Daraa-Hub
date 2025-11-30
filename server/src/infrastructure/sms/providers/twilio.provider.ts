import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';
import { ISmsService } from '../sms.interface';

/**
 * Twilio SMS provider implementation
 */
@Injectable()
export class TwilioSmsProvider implements ISmsService {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private twilioClient: twilio.Twilio;
  private twilioPhoneNumber: string;

  constructor(private configService: ConfigService) {
    const accountSid =
      this.configService.get<string>('twilio.accountSid') || '';
    const authToken = this.configService.get<string>('twilio.authToken') || '';
    this.twilioPhoneNumber =
      this.configService.get<string>('twilio.phoneNumber') || '';

    // Only initialize Twilio if valid credentials are provided
    if (
      accountSid &&
      authToken &&
      accountSid.startsWith('AC') &&
      authToken.length > 10
    ) {
      try {
        this.twilioClient = twilio.default(accountSid, authToken);
        this.logger.log('Twilio client initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Twilio client:', error.message);
        throw error;
      }
    } else {
      throw new Error('Twilio credentials not configured properly');
    }
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your Daraa verification code is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`;
    return this.sendMessage(phoneNumber, message);
  }

  async sendPasswordResetOtp(
    phoneNumber: string,
    otp: string,
  ): Promise<boolean> {
    const message = `Your Daraa password reset code is: ${otp}. This code will expire in 5 minutes. If you didn't request this, please ignore this message.`;
    return this.sendMessage(phoneNumber, message);
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    try {
      const result = await this.twilioClient.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: phoneNumber,
      });

      this.logger.log(
        `SMS sent successfully to ${phoneNumber}. SID: ${result.sid}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${phoneNumber}: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }
}
