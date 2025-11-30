import { IsString, IsNumber, IsOptional, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AwardPointsDto {
  @IsString()
  customerId: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  orderId?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;
}
