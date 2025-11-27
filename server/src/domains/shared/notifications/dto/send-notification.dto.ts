import { IsString, IsEnum, IsOptional, IsObject, IsArray } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  templateCode: string;

  @IsString()
  recipientId: string;

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsEnum(['push', 'email', 'sms', 'in_app'], { each: true })
  channels?: ('push' | 'email' | 'sms' | 'in_app')[];

  @IsOptional()
  @IsString()
  relatedId?: string;

  @IsOptional()
  @IsString()
  relatedModel?: string;
}

export class SendBulkNotificationDto {
  @IsString()
  templateCode: string;

  @IsArray()
  @IsString({ each: true })
  recipientIds: string[];

  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsEnum(['push', 'email', 'sms', 'in_app'], { each: true })
  channels?: ('push' | 'email' | 'sms' | 'in_app')[];
}

