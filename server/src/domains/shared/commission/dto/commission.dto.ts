import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsBoolean,
} from 'class-validator';
import {
  CommissionStatus,
  CommissionType,
} from '../../../../database/schemas/commission.schema';
import { ConfigEntityType } from '../../../../database/schemas/commission-config.schema';

/**
 * DTO لحساب العمولة
 */
export class CalculateCommissionDto {
  @IsMongoId()
  orderId: string;

  @IsMongoId()
  storeAccountId: string;

  @IsOptional()
  @IsMongoId()
  courierAccountId?: string;

  @IsNumber()
  @Min(0)
  orderAmount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsMongoId()
  storeCategoryId?: string;
}

/**
 * DTO لإنشاء/تحديث إعداد العمولة
 */
export class CreateCommissionConfigDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsEnum(ConfigEntityType)
  entityType: ConfigEntityType;

  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  platformFeeRate: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  deliveryFeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  paymentFeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minCommission?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxCommission?: number;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO لتحديث إعداد العمولة
 */
export class UpdateCommissionConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  platformFeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  deliveryFeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  paymentFeeRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minCommission?: number;

  @IsOptional()
  @IsNumber()
  maxCommission?: number;

  @IsOptional()
  @IsNumber()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO لفلترة العمولات
 */
export class CommissionFilterDto {
  @IsOptional()
  @IsMongoId()
  storeAccountId?: string;

  @IsOptional()
  @IsMongoId()
  courierAccountId?: string;

  @IsOptional()
  @IsEnum(CommissionType)
  type?: CommissionType;

  @IsOptional()
  @IsEnum(CommissionStatus)
  status?: CommissionStatus;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}

/**
 * DTO لصرف الأرباح
 */
export class PayoutDto {
  @IsMongoId()
  accountId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number; // إذا لم يحدد، يصرف كل الأرباح المعلقة

  @IsOptional()
  @IsString()
  notes?: string;
}
