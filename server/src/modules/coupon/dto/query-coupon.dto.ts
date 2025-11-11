import { IsEnum, IsOptional, IsString, IsNumber, Min, IsBoolean, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { CouponType } from '../../../database/schemas/coupon.schema';

export class QueryCouponDto {
  @IsOptional()
  @IsEnum(CouponType)
  type?: CouponType;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsOptional()
  @IsMongoId()
  storeId?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsMongoId()
  productId?: string;

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

