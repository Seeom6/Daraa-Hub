import { IsEnum, IsOptional, IsDateString, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalyticsPeriod } from '../../../database/schemas/product-analytics.schema';

export class QueryAnalyticsDto {
  @IsEnum(AnalyticsPeriod)
  @IsOptional()
  period?: AnalyticsPeriod;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsMongoId()
  @IsOptional()
  productId?: string;

  @IsMongoId()
  @IsOptional()
  storeId?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}

