import { IsString, IsEnum, IsOptional } from 'class-validator';

export class ReviewVerificationDto {
  @IsEnum(['approve', 'reject', 'request_info'])
  action: 'approve' | 'reject' | 'request_info';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  infoRequired?: string;
}

