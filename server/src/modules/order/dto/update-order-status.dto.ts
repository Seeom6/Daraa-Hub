import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../../../database/schemas/order.schema';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

