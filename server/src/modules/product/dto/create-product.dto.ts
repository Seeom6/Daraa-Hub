import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  IsMongoId,
  IsEnum,
  Min,
  Max,
  MaxLength,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProductStatus, ProductUnit } from '../../../database/schemas/product.schema';

export class CreateProductDto {
  @IsMongoId()
  storeId: string;

  @IsMongoId()
  categoryId: string;

  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @MaxLength(250)
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  shortDescription?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  barcode?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  compareAtPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pointsPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costPrice?: number;

  @IsOptional()
  @IsEnum(ProductUnit)
  unit?: ProductUnit;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  unitValue?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  mainImage?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsObject()
  specifications?: Record<string, string>;

  @IsOptional()
  @IsBoolean()
  hasVariants?: boolean;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  @Transform(({ value }) => value?.trim())
  seoDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[];
}

