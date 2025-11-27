import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phoneNumber: string;
}

