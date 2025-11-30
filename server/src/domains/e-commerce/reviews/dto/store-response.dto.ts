import { IsString, MaxLength } from 'class-validator';

export class StoreResponseDto {
  @IsString()
  @MaxLength(500)
  message: string;
}
