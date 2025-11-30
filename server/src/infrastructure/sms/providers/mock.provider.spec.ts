import { MockSmsProvider } from './mock.provider';

describe('MockSmsProvider', () => {
  let provider: MockSmsProvider;

  beforeEach(() => {
    provider = new MockSmsProvider();
  });

  describe('sendOtp', () => {
    it('should log OTP message and return true', async () => {
      const result = await provider.sendOtp('+963991234567', '123456');

      expect(result).toBe(true);
    });

    it('should handle different phone numbers', async () => {
      const result = await provider.sendOtp('+1234567890', '654321');

      expect(result).toBe(true);
    });
  });

  describe('sendPasswordResetOtp', () => {
    it('should log password reset OTP and return true', async () => {
      const result = await provider.sendPasswordResetOtp(
        '+963991234567',
        '789012',
      );

      expect(result).toBe(true);
    });
  });

  describe('sendMessage', () => {
    it('should log custom message and return true', async () => {
      const result = await provider.sendMessage(
        '+963991234567',
        'Test message',
      );

      expect(result).toBe(true);
    });

    it('should handle Arabic messages', async () => {
      const result = await provider.sendMessage(
        '+963991234567',
        'مرحبا بك في درعا',
      );

      expect(result).toBe(true);
    });
  });
});
