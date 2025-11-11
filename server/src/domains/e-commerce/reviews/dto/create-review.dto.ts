import {
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  Min,
  Max,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewTargetType } from '../../../../database/schemas/review.schema';

export class CreateReviewDto {
  @IsEnum(ReviewTargetType)
  targetType: ReviewTargetType;

  @IsMongoId()
  targetId: string;

  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @Type(() => Number)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];
}

