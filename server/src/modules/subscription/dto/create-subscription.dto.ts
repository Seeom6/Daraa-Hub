import { IsMongoId, IsEnum, IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { SubscriptionPaymentMethod } from '../../../database/schemas/store-subscription.schema';

export class CreateSubscriptionDto {
  @IsMongoId()
  storeId: string;

  @IsMongoId()
  planId: string;

  @IsEnum(SubscriptionPaymentMethod)
  paymentMethod: SubscriptionPaymentMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsString()
  paymentReference?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

