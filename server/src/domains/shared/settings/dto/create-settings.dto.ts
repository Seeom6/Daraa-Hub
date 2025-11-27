import { IsString, IsEnum, IsObject, IsBoolean, IsOptional } from 'class-validator';

export class CreateSettingsDto {
  @IsString()
  key: string;

  @IsEnum(['general', 'payment', 'shipping', 'notifications', 'security', 'commission', 'features'])
  category: 'general' | 'payment' | 'shipping' | 'notifications' | 'security' | 'commission' | 'features';

  @IsObject()
  value: Record<string, any>;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

