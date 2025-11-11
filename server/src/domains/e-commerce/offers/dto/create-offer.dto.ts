import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsArray, IsMongoId, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '../../../../database/schemas/offer.schema';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discountType: DiscountType;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  discountValue: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minPurchaseAmount?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountAmount?: number;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  applicableProducts?: string[];

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  @IsNotEmpty()
  endDate: Date;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

