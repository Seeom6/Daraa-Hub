import { IsMongoId, IsNumber, IsOptional, IsObject, Min } from 'class-validator';

export class AddToCartDto {
  @IsMongoId()
  productId: string;

  @IsOptional()
  @IsMongoId()
  variantId?: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsObject()
  selectedOptions?: Record<string, any>;
}

