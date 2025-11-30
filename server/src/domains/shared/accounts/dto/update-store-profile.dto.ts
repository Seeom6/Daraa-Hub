import { IsString, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class UpdateStoreProfileDto {
  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsString()
  storeDescription?: string;

  @IsOptional()
  @IsString()
  storeLogo?: string;

  @IsOptional()
  @IsString()
  storeBanner?: string;

  @IsOptional()
  @IsMongoId()
  primaryCategory?: string; // التصنيف الرئيسي للمتجر

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  storeCategories?: string[]; // تصنيفات المتجر

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;
}
