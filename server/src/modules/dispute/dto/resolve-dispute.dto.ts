import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DisputeResolutionAction } from '../../../database/schemas/dispute.schema';

export class ResolveDisputeDto {
  @IsEnum(DisputeResolutionAction)
  action: DisputeResolutionAction;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

