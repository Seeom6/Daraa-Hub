import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsMongoId,
  IsObject,
  Min,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateVariantDto {
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  sku?: string;

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
  @IsObject()
  attributes?: Record<string, string>;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  image?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

