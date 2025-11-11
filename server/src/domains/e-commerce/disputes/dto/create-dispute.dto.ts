import { IsString, IsEnum, IsOptional, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { DisputeType, DisputePriority } from '../../../../database/schemas/dispute.schema';

export class EvidenceDto {
  @IsString()
  type: string;

  @IsString()
  url: string;
}

export class CreateDisputeDto {
  @IsMongoId()
  orderId: string;

  @IsMongoId()
  reportedAgainst: string;

  @IsEnum(DisputeType)
  type: DisputeType;

  @IsOptional()
  @IsEnum(DisputePriority)
  priority?: DisputePriority;

  @IsString()
  description: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EvidenceDto)
  evidence?: EvidenceDto[];
}

