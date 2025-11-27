import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInventoryDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  lowStockThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  reorderPoint?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  reorderQuantity?: number;
}

