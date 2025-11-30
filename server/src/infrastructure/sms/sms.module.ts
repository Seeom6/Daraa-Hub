import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TwilioSmsProvider } from './providers/twilio.provider';
import { MockSmsProvider } from './providers/mock.provider';

/**
 * SMS Module with provider pattern
 * Automatically selects the appropriate provider based on configuration
 */
@Module({
  providers: [
    {
      provide: 'SMS_SERVICE',
      useFactory: (configService: ConfigService) => {
        const nodeEnv = configService.get<string>('nodeEnv');
        const accountSid = configService.get<string>('twilio.accountSid');
        const authToken = configService.get<string>('twilio.authToken');

        // Use mock provider in development or if Twilio is not configured
        const useMock =
          nodeEnv === 'development' ||
          !accountSid ||
          !authToken ||
          !accountSid.startsWith('AC') ||
          authToken.length < 10;

        if (useMock) {
          return new MockSmsProvider();
        }

        return new TwilioSmsProvider(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SMS_SERVICE'],
})
export class SmsModule {}
