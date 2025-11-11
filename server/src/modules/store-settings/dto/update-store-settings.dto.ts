import {
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  IsString,
  IsUrl,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class BusinessHoursDto {
  @IsString()
  day: string;

  @IsBoolean()
  isOpen: boolean;

  @IsOptional()
  @IsString()
  openTime?: string;

  @IsOptional()
  @IsString()
  closeTime?: string;
}

class ShippingZoneDto {
  @IsString()
  name: string;

  @IsArray()
  @IsString({ each: true })
  cities: string[];

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  shippingFee: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  freeShippingThreshold?: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  estimatedDays: number;
}

class PaymentMethodDto {
  @IsString()
  method: string;

  @IsBoolean()
  isEnabled: boolean;

  @IsOptional()
  @IsString()
  details?: string;
}

export class UpdateStoreSettingsDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHoursDto)
  businessHours?: BusinessHoursDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShippingZoneDto)
  shippingZones?: ShippingZoneDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  defaultShippingFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  freeShippingThreshold?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentMethodDto)
  paymentMethods?: PaymentMethodDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxOrderAmount?: number;

  @IsOptional()
  @IsBoolean()
  allowCashOnDelivery?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  orderCancellationPeriod?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  returnPeriod?: number;

  @IsOptional()
  @IsBoolean()
  allowReturns?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  returnPolicy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  refundPolicy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  termsAndConditions?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  privacyPolicy?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  shippingPolicy?: string;

  @IsOptional()
  @IsBoolean()
  notifyOnNewOrder?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnLowStock?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnReview?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  taxRate?: number;

  @IsOptional()
  @IsBoolean()
  includeTaxInPrice?: boolean;

  @IsOptional()
  @IsBoolean()
  enablePointsSystem?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pointsPerCurrency?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  pointsRedemptionRate?: number;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @IsOptional()
  @IsUrl()
  telegramUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  maintenanceMessage?: string;
}

