import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class AddMessageDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsBoolean()
  isAdminMessage?: boolean;
}

