import { IsBoolean } from 'class-validator';

export class MarkHelpfulDto {
  @IsBoolean()
  helpful: boolean; // true = helpful, false = not helpful
}

