import { IsOptional, IsEnum, IsMongoId, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { DisputeStatus, DisputeType, DisputePriority } from '../../../database/schemas/dispute.schema';

export class QueryDisputeDto {
  @IsOptional()
  @IsEnum(DisputeStatus)
  status?: DisputeStatus;

  @IsOptional()
  @IsEnum(DisputeType)
  type?: DisputeType;

  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;

  @IsOptional()
  @IsMongoId()
  orderId?: string;

  @IsOptional()
  @IsMongoId()
  reportedBy?: string;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

