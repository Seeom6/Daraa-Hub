import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReviewStatus } from '../../../../database/schemas/review.schema';

export class ModerateReviewDto {
  @IsEnum(ReviewStatus)
  status: ReviewStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  moderationNotes?: string;
}

