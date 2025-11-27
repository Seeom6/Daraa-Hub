import { IsOptional, IsString, IsBoolean, IsMongoId, IsNumber, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class QueryCategoryDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsMongoId()
  parentCategory?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  level?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isActive?: boolean;

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
  sortBy?: string = 'order';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';
}

