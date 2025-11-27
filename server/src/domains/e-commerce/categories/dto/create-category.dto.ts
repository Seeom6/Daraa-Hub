import { IsString, IsOptional, IsBoolean, IsNumber, IsMongoId, IsArray, Min, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @MaxLength(150)
  @Transform(({ value }) => value?.toLowerCase().trim())
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  icon?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  image?: string;

  @IsOptional()
  @IsMongoId()
  parentCategory?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  level?: number;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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

