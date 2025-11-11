import { IsEnum, IsOptional, IsNumber, Min, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnStatus, RefundMethod } from '../../../../database/schemas/return.schema';

export class UpdateReturnDto {
  @IsOptional()
  @IsEnum(ReturnStatus)
  status?: ReturnStatus;

  @IsOptional()
  @IsNumber()
  @Min(0)
  refundAmount?: number;

  @IsOptional()
  @IsEnum(RefundMethod)
  refundMethod?: RefundMethod;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  pickupScheduled?: Date;
}

