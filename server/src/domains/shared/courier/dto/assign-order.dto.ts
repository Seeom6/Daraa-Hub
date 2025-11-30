import { IsString, IsMongoId } from 'class-validator';

export class AssignOrderDto {
  @IsMongoId()
  orderId: string;

  @IsMongoId()
  courierId: string;
}
