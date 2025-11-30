import { OtpType } from './otp-type.enum';

describe('OtpType Enum', () => {
  it('should have REGISTRATION value', () => {
    expect(OtpType.REGISTRATION).toBe('registration');
  });

  it('should have FORGOT_PASSWORD value', () => {
    expect(OtpType.FORGOT_PASSWORD).toBe('forgot_password');
  });

  it('should have PHONE_VERIFICATION value', () => {
    expect(OtpType.PHONE_VERIFICATION).toBe('phone_verification');
  });

  it('should have exactly 3 values', () => {
    const values = Object.values(OtpType);
    expect(values).toHaveLength(3);
  });

  it('should be usable in switch statements', () => {
    const getOtpMessage = (type: OtpType): string => {
      switch (type) {
        case OtpType.REGISTRATION:
          return 'Registration OTP';
        case OtpType.FORGOT_PASSWORD:
          return 'Password Reset OTP';
        case OtpType.PHONE_VERIFICATION:
          return 'Phone Verification OTP';
        default:
          return 'Unknown';
      }
    };

    expect(getOtpMessage(OtpType.REGISTRATION)).toBe('Registration OTP');
    expect(getOtpMessage(OtpType.FORGOT_PASSWORD)).toBe('Password Reset OTP');
    expect(getOtpMessage(OtpType.PHONE_VERIFICATION)).toBe(
      'Phone Verification OTP',
    );
  });
});
