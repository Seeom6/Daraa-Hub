import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class ApplyReferralDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsMongoId()
  @IsNotEmpty()
  referredId: string;
}

