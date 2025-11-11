import { IsString, IsEnum, IsNumber, IsOptional, IsBoolean, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PlanType } from '../../../../database/schemas/subscription-plan.schema';

export class PlanFeaturesDto {
  @IsNumber()
  @Min(1)
  dailyProductLimit: number;

  @IsNumber()
  @Min(1)
  maxImagesPerProduct: number;

  @IsNumber()
  @Min(0)
  maxVariantsPerProduct: number;

  @IsOptional()
  @IsBoolean()
  prioritySupport?: boolean;

  @IsOptional()
  @IsBoolean()
  analyticsAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  customDomain?: boolean;
}

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsEnum(PlanType)
  type: PlanType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  priceUSD: number;

  @IsNumber()
  @Min(0)
  priceSYP: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number;

  @ValidateNested()
  @Type(() => PlanFeaturesDto)
  features: PlanFeaturesDto;

  @IsOptional()
  @IsNumber()
  order?: number;
}

