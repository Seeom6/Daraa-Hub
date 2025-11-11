import { IsEnum, IsOptional, IsString, IsNumber, Min, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ReferralStatus } from '../../../database/schemas/referral.schema';

export class QueryReferralDto {
  @IsOptional()
  @IsMongoId()
  referrerId?: string;

  @IsOptional()
  @IsMongoId()
  referredId?: string;

  @IsOptional()
  @IsEnum(ReferralStatus)
  status?: ReferralStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

