import { IsString, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';

export class SuspendUserDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  durationDays?: number; // null or undefined = permanent ban

  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean = true;
}

export class UnsuspendUserDto {
  @IsString()
  reason: string;

  @IsOptional()
  @IsBoolean()
  notifyUser?: boolean = true;
}

