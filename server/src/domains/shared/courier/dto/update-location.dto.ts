import { IsNumber, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class UpdateLocationDto {
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  coordinates: number[]; // [longitude, latitude]
}

