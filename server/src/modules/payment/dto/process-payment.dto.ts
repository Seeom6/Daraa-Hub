import { IsMongoId, IsEnum, IsOptional, IsObject, IsNumber, Min } from 'class-validator';
import { PaymentMethodType } from '../../../database/schemas/payment.schema';

export class ProcessPaymentDto {
  @IsMongoId()
  orderId: string;

  @IsEnum(PaymentMethodType)
  paymentMethod: PaymentMethodType;

  @IsOptional()
  @IsObject()
  paymentBreakdown?: {
    cash?: number;
    card?: number;
    points?: number;
    wallet?: number;
  };

  @IsOptional()
  @IsObject()
  gatewayResponse?: Record<string, any>;
}

