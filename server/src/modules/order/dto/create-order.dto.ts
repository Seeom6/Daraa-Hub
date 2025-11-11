import {
  IsMongoId,
  IsEnum,
  IsString,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../../database/schemas/order.schema';

export class DeliveryAddressDto {
  @IsString()
  fullName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  fullAddress: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsObject()
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsMongoId()
  storeId: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ValidateNested()
  @Type(() => DeliveryAddressDto)
  deliveryAddress: DeliveryAddressDto;

  @IsOptional()
  @IsMongoId()
  appliedCoupon?: string;

  @IsOptional()
  @IsString()
  customerNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pointsToUse?: number; // Loyalty points to use for payment
}

