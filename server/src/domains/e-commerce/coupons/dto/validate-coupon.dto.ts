import { IsNotEmpty, IsString, IsNumber, IsOptional, IsMongoId, Min } from 'class-validator';

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsMongoId()
  @IsNotEmpty()
  customerId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  orderAmount: number;

  @IsMongoId()
  @IsOptional()
  storeId?: string;

  @IsMongoId()
  @IsOptional()
  categoryId?: string;

  @IsMongoId()
  @IsOptional()
  productId?: string;
}

