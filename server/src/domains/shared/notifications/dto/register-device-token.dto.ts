import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  token: string;

  @IsEnum(['ios', 'android', 'web'])
  platform: 'ios' | 'android' | 'web';

  @IsOptional()
  @IsObject()
  deviceInfo?: {
    deviceId?: string;
    deviceName?: string;
    osVersion?: string;
    appVersion?: string;
    manufacturer?: string;
    model?: string;
  };
}

