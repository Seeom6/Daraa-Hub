import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class RegisterStep1Dto {
  @IsNotEmpty({ message: 'Full name is required' })
  @IsString()
  @MinLength(2, { message: 'Full name must be at least 2 characters long' })
  fullName: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone number must be a valid international format',
  })
  phoneNumber: string;

  @IsNotEmpty({ message: 'Country code is required' })
  @IsString()
  countryCode: string;
}

