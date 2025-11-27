import { IsNotEmpty, IsNumber, Min, IsString } from 'class-validator';

export class RedeemPointsDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  points: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}

