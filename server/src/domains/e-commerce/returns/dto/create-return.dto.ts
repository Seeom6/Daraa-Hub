import {
  IsMongoId,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsString,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ReturnReason,
  ReturnMethod,
} from '../../../../database/schemas/return.schema';

export class ReturnItemDto {
  @IsMongoId()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsEnum(ReturnReason)
  reason: ReturnReason;

  @IsOptional()
  @IsString()
  detailedReason?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class CreateReturnDto {
  @IsMongoId()
  orderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];

  @IsEnum(ReturnMethod)
  returnMethod: ReturnMethod;
}
