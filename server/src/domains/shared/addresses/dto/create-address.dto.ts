import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { AddressType } from '../../../../database/schemas/address.schema';

export class CreateAddressDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  label: string; // e.g., "المنزل", "العمل"

  @IsEnum(AddressType)
  @IsOptional()
  type?: AddressType = AddressType.HOME;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  fullName: string; // Recipient name

  @IsString()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Phone number must be valid (10-15 digits)',
  })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Alternate phone must be valid (10-15 digits)',
  })
  alternatePhone?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string; // المدينة

  @IsString()
  @IsOptional()
  @MaxLength(100)
  district?: string; // الحي

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  street: string; // الشارع

  @IsString()
  @IsOptional()
  @MaxLength(100)
  building?: string; // رقم/اسم المبنى

  @IsString()
  @IsOptional()
  @MaxLength(50)
  floor?: string; // الطابق

  @IsString()
  @IsOptional()
  @MaxLength(50)
  apartment?: string; // رقم الشقة

  @IsString()
  @IsOptional()
  @MaxLength(200)
  nearbyLandmark?: string; // علامة مميزة

  @IsString()
  @IsOptional()
  @MaxLength(500)
  fullAddress?: string; // العنوان الكامل (if not provided, will be generated)

  @IsNumber()
  @IsOptional()
  latitude?: number; // خط العرض

  @IsNumber()
  @IsOptional()
  longitude?: number; // خط الطول

  @IsString()
  @IsOptional()
  @MaxLength(500)
  deliveryInstructions?: string; // تعليمات التوصيل

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean = false;
}
