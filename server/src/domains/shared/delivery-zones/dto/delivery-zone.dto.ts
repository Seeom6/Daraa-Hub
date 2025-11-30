import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ZoneType,
  ZoneStatus,
} from '../../../../database/schemas/delivery-zone.schema';

/**
 * DTO لساعات العمل
 */
export class WorkingHoursDto {
  @IsNumber()
  @Min(0)
  @Max(6)
  day: number;

  @IsString()
  openTime: string;

  @IsString()
  closeTime: string;

  @IsOptional()
  @IsBoolean()
  isOpen?: boolean;
}

/**
 * DTO لإنشاء منطقة توصيل
 */
export class CreateDeliveryZoneDto {
  @IsString()
  name: string;

  @IsString()
  nameAr: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsEnum(ZoneType)
  type?: ZoneType;

  @IsOptional()
  @IsMongoId()
  parentZoneId?: string;

  @IsNumber()
  @Min(0)
  deliveryFee: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDeliveryTimeMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDeliveryTimeMax?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  coordinates?: number[][][]; // Polygon coordinates
}

/**
 * DTO لتحديث منطقة توصيل
 */
export class UpdateDeliveryZoneDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @IsOptional()
  @IsEnum(ZoneType)
  type?: ZoneType;

  @IsOptional()
  @IsEnum(ZoneStatus)
  status?: ZoneStatus;

  @IsOptional()
  @IsMongoId()
  parentZoneId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  freeDeliveryThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDeliveryTimeMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDeliveryTimeMax?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkingHoursDto)
  workingHours?: WorkingHoursDto[];

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  coordinates?: number[][][];
}

/**
 * DTO لإضافة متجر إلى منطقة
 */
export class AddStoreToZoneDto {
  @IsMongoId()
  zoneId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customDeliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customMinOrderAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customFreeDeliveryThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  customDeliveryTimeMin?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  customDeliveryTimeMax?: number;

  @IsOptional()
  @IsNumber()
  priority?: number;
}

/**
 * DTO للبحث عن منطقة بالموقع
 */
export class LocationQueryDto {
  @IsNumber()
  longitude: number;

  @IsNumber()
  latitude: number;

  @IsOptional()
  @IsNumber()
  @Min(100)
  maxDistanceMeters?: number;
}
