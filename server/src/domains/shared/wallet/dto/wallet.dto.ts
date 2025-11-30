import {
  IsString,
  IsNumber,
  IsOptional,
  IsPositive,
  Min,
  IsEnum,
  IsDateString,
  IsMongoId,
} from 'class-validator';
import { TransactionType } from '../../../../database/schemas/wallet-transaction.schema';

/**
 * DTO للإيداع
 */
export class DepositDto {
  @IsMongoId()
  accountId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO لطلب السحب
 */
export class WithdrawRequestDto {
  @IsNumber()
  @IsPositive()
  @Min(1000)
  amount: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * DTO للتحويل بين المحافظ
 */
export class TransferDto {
  @IsMongoId()
  toAccountId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsString()
  description?: string;
}

/**
 * DTO للدفع من المحفظة
 */
export class PayFromWalletDto {
  @IsMongoId()
  orderId: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}

/**
 * DTO لتجميد المحفظة
 */
export class FreezeWalletDto {
  @IsMongoId()
  accountId: string;

  @IsString()
  reason: string;
}

/**
 * DTO لفلترة المعاملات
 */
export class TransactionFilterDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

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
 * DTO لتعديل الرصيد (Admin)
 */
export class AdjustBalanceDto {
  @IsMongoId()
  accountId: string;

  @IsNumber()
  amount: number;

  @IsString()
  reason: string;
}
