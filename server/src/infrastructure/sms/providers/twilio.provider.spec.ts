import { ConfigService } from '@nestjs/config';

// Mock the twilio module before importing TwilioSmsProvider
const mockMessagesCreate = jest.fn();
const mockTwilioClient = {
  messages: {
    create: mockMessagesCreate,
  },
};

jest.mock('twilio', () => {
  return {
    __esModule: true,
    default: jest.fn(() => mockTwilioClient),
  };
});

import { TwilioSmsProvider } from './twilio.provider';

describe('TwilioSmsProvider', () => {
  let provider: TwilioSmsProvider;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          'twilio.accountSid': 'ACtest1234567890abcdef1234567890ab',
          'twilio.authToken': 'test_auth_token_12345',
          'twilio.phoneNumber': '+15551234567',
        };
        return config[key];
      }),
    };

    provider = new TwilioSmsProvider(mockConfigService as ConfigService);
  });

  describe('constructor', () => {
    it('should throw error when credentials not configured', () => {
      const badConfigService = {
        get: jest.fn().mockReturnValue(''),
      };

      expect(() => new TwilioSmsProvider(badConfigService as any)).toThrow(
        'Twilio credentials not configured properly',
      );
    });

    it('should throw error when accountSid does not start with AC', () => {
      const badConfigService = {
        get: jest.fn((key: string) => {
          const config: Record<string, string> = {
            'twilio.accountSid': 'invalid_account_sid',
            'twilio.authToken': 'test_auth_token_12345',
            'twilio.phoneNumber': '+15551234567',
          };
          return config[key];
        }),
      };

      expect(() => new TwilioSmsProvider(badConfigService as any)).toThrow(
        'Twilio credentials not configured properly',
      );
    });
  });

  describe('sendOtp', () => {
    it('should send OTP message via Twilio', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM123' });

      const result = await provider.sendOtp('+963991234567', '123456');

      expect(result).toBe(true);
      expect(mockMessagesCreate).toHaveBeenCalledWith({
        body: expect.stringContaining('123456'),
        from: '+15551234567',
        to: '+963991234567',
      });
    });
  });

  describe('sendPasswordResetOtp', () => {
    it('should send password reset OTP via Twilio', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM456' });

      const result = await provider.sendPasswordResetOtp(
        '+963991234567',
        '654321',
      );

      expect(result).toBe(true);
      expect(mockMessagesCreate).toHaveBeenCalledWith({
        body: expect.stringContaining('password reset'),
        from: '+15551234567',
        to: '+963991234567',
      });
    });
  });

  describe('sendMessage', () => {
    it('should send custom message via Twilio', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM789' });

      const result = await provider.sendMessage(
        '+963991234567',
        'Custom message',
      );

      expect(result).toBe(true);
      expect(mockMessagesCreate).toHaveBeenCalledWith({
        body: 'Custom message',
        from: '+15551234567',
        to: '+963991234567',
      });
    });

    it('should return false when Twilio API fails', async () => {
      mockMessagesCreate.mockRejectedValue(new Error('API Error'));

      const result = await provider.sendMessage('+963991234567', 'Test');

      expect(result).toBe(false);
    });
  });
});
