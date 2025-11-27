import { IsMongoId, IsString } from 'class-validator';

export class RejectOrderDto {
  @IsMongoId()
  orderId: string;

  @IsString()
  reason: string;
}

