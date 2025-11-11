import { IsNumber, IsString, Min } from 'class-validator';

export class RefundPaymentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  reason: string;
}

