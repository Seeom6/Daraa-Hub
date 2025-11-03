/**
 * Interface for SMS service providers
 * Allows easy swapping between different SMS providers (Twilio, Mock, etc.)
 */
export interface ISmsService {
  /**
   * Send OTP via SMS
   * @param phoneNumber - Recipient phone number in international format
   * @param otp - The OTP code to send
   */
  sendOtp(phoneNumber: string, otp: string): Promise<boolean>;

  /**
   * Send password reset OTP via SMS
   * @param phoneNumber - Recipient phone number
   * @param otp - The OTP code to send
   */
  sendPasswordResetOtp(phoneNumber: string, otp: string): Promise<boolean>;

  /**
   * Send a custom message via SMS
   * @param phoneNumber - Recipient phone number
   * @param message - The message to send
   */
  sendMessage(phoneNumber: string, message: string): Promise<boolean>;
}

