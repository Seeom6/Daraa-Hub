import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsMongoId, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RewardType } from '../../../../database/schemas/referral.schema';

export class RewardDetailDto {
  @IsEnum(RewardType)
  @IsNotEmpty()
  type: RewardType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  value: number;
}

export class RewardInfoDto {
  @ValidateNested()
  @Type(() => RewardDetailDto)
  @IsNotEmpty()
  referrerReward: RewardDetailDto;

  @ValidateNested()
  @Type(() => RewardDetailDto)
  @IsNotEmpty()
  referredReward: RewardDetailDto;
}

export class CreateReferralDto {
  @IsMongoId()
  @IsNotEmpty()
  referrerId: string;

  @ValidateNested()
  @Type(() => RewardInfoDto)
  @IsNotEmpty()
  reward: RewardInfoDto;

  @IsString()
  @IsOptional()
  code?: string; // Optional, will be auto-generated if not provided
}

