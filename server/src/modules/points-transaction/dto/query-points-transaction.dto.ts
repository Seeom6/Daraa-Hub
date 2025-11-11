import { IsEnum, IsOptional, IsString, IsNumber, Min, IsMongoId, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { TransactionType } from '../../../database/schemas/points-transaction.schema';

export class QueryPointsTransactionDto {
  @IsOptional()
  @IsMongoId()
  customerId?: string;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isExpired?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

