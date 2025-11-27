import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsArray, IsMongoId, IsDate, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '../../../../database/schemas/coupon.schema';

export class UsageLimitDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  total?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  perUser?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  perDay?: number;
}

export class ApplicableToDto {
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  stores?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  categories?: string[];

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  products?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  userTiers?: string[];

  @IsBoolean()
  @IsOptional()
  newUsersOnly?: boolean;
}

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(CouponType)
  @IsNotEmpty()
  type: CouponType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  discountValue: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchaseAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @ValidateNested()
  @Type(() => UsageLimitDto)
  @IsOptional()
  usageLimit?: UsageLimitDto;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  validFrom: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  validUntil: Date;

  @ValidateNested()
  @Type(() => ApplicableToDto)
  @IsOptional()
  applicableTo?: ApplicableToDto;

  @IsBoolean()
  @IsOptional()
  autoApply?: boolean;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

