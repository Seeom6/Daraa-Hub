import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsMongoId,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductStatus } from '../../../../database/schemas/product.schema';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsMongoId()
  storeId?: string;

  @IsOptional()
  @IsMongoId()
  categoryId?: string;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasVariants?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @IsString()
  tags?: string; // Comma-separated tags

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

