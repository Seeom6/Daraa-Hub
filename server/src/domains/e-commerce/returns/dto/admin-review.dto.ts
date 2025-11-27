import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AdminReviewDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

