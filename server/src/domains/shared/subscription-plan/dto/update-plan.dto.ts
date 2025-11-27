import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanDto } from './create-plan.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePlanDto extends PartialType(CreatePlanDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

