import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsMongoId, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../database/schemas/points-transaction.schema';

export class CreatePointsTransactionDto {
  @IsMongoId()
  @IsNotEmpty()
  customerId: string;

  @IsEnum(TransactionType)
  @IsNotEmpty()
  type: TransactionType;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsMongoId()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  balanceBefore?: number;

  @IsNumber()
  @IsOptional()
  balanceAfter?: number;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  expiresAt?: Date;
}

