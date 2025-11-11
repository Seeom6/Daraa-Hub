import { IsOptional, IsEnum, IsMongoId, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnStatus } from '../../../database/schemas/return.schema';

export class QueryReturnDto {
  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus;

  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @IsOptional()
  @IsMongoId()
  customerId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

