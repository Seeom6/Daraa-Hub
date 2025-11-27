import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateDeliveryStatusDto {
  @IsEnum(['picked_up', 'delivering', 'delivered'])
  status: 'picked_up' | 'delivering' | 'delivered';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  proofOfDelivery?: string; // Image URL or signature
}

