import { IsString, IsOptional, IsNumber, IsBoolean, IsMongoId, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStoreCategoryDto {
  @IsString()
  name: string; // اسم التصنيف

  @IsString()
  slug: string; // معرف فريد

  @IsOptional()
  @IsString()
  description?: string; // وصف التصنيف

  @IsOptional()
  @IsString()
  icon?: string; // أيقونة

  @IsOptional()
  @IsString()
  image?: string; // صورة

  @IsOptional()
  @IsMongoId()
  parentCategory?: string; // التصنيف الأب

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  level?: number; // المستوى

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  order?: number; // ترتيب العرض

  @IsOptional()
  @IsBoolean()
  isActive?: boolean; // نشط؟

  @IsOptional()
  @IsString()
  seoTitle?: string; // عنوان SEO

  @IsOptional()
  @IsString()
  seoDescription?: string; // وصف SEO

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  seoKeywords?: string[]; // كلمات مفتاحية
}

