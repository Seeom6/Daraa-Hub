import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class AcceptOrderDto {
  @IsMongoId()
  orderId: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

