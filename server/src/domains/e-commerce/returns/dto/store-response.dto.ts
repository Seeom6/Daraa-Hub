import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class StoreResponseDto {
  @IsBoolean()
  approved: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
