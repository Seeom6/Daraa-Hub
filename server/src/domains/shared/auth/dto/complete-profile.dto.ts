import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CompleteProfileDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phoneNumber: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
}

