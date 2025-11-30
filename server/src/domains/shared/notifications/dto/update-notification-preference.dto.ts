import {
  IsOptional,
  IsEnum,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChannelPreferencesDto {
  @IsOptional()
  @IsBoolean()
  push?: boolean;

  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  sms?: boolean;

  @IsOptional()
  @IsBoolean()
  in_app?: boolean;
}

class CategoryPreferencesDto {
  @IsOptional()
  @IsBoolean()
  orders?: boolean;

  @IsOptional()
  @IsBoolean()
  payments?: boolean;

  @IsOptional()
  @IsBoolean()
  delivery?: boolean;

  @IsOptional()
  @IsBoolean()
  verification?: boolean;

  @IsOptional()
  @IsBoolean()
  account?: boolean;

  @IsOptional()
  @IsBoolean()
  promotions?: boolean;

  @IsOptional()
  @IsBoolean()
  system?: boolean;

  @IsOptional()
  @IsBoolean()
  security?: boolean;

  @IsOptional()
  @IsBoolean()
  reviews?: boolean;

  @IsOptional()
  @IsBoolean()
  disputes?: boolean;
}

class QuietHoursDto {
  @IsBoolean()
  enabled: boolean;

  @IsOptional()
  @IsString()
  startTime?: string; // e.g., "22:00"

  @IsOptional()
  @IsString()
  endTime?: string; // e.g., "08:00"

  @IsOptional()
  @IsString()
  timezone?: string; // e.g., "Asia/Damascus"
}

export class UpdateNotificationPreferenceDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ChannelPreferencesDto)
  channels?: ChannelPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => CategoryPreferencesDto)
  categories?: CategoryPreferencesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => QuietHoursDto)
  quietHours?: QuietHoursDto;

  @IsOptional()
  @IsEnum(['ar', 'en'])
  language?: 'ar' | 'en';

  @IsOptional()
  @IsEnum(['instant', 'daily', 'weekly', 'never'])
  emailDigest?: 'instant' | 'daily' | 'weekly' | 'never';
}
