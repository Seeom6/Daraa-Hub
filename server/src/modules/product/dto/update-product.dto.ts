import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { OmitType } from '@nestjs/mapped-types';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['storeId'] as const),
) {}

