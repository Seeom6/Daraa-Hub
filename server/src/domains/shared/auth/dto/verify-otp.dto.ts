import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phoneNumber: string;

  @IsNotEmpty({ message: 'OTP is required' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otp: string;
}

