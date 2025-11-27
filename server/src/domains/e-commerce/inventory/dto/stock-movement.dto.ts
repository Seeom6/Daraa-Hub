import { IsEnum, IsNumber, IsString, IsOptional, IsMongoId, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { MovementType } from '../../../../database/schemas/inventory.schema';

export class StockMovementDto {
  @IsEnum(MovementType)
  type: MovementType;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  quantity: number;

  @IsString()
  @Transform(({ value }) => value?.trim())
  reason: string;

  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  notes?: string;
}

