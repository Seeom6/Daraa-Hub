import { IsString, IsEnum, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  recipientId: string;

  @IsEnum(['customer', 'store_owner', 'courier', 'admin'])
  recipientRole: 'customer' | 'store_owner' | 'courier' | 'admin';

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsEnum(['order', 'payment', 'delivery', 'verification', 'account', 'promotion', 'system', 'security', 'review', 'dispute'])
  type: 'order' | 'payment' | 'delivery' | 'verification' | 'account' | 'promotion' | 'system' | 'security' | 'review' | 'dispute';

  @IsOptional()
  @IsEnum(['info', 'success', 'warning', 'error'])
  priority?: 'info' | 'success' | 'warning' | 'error';

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  relatedId?: string;

  @IsOptional()
  @IsString()
  relatedModel?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(['push', 'email', 'sms', 'in_app'], { each: true })
  channels?: ('push' | 'email' | 'sms' | 'in_app')[];

  @IsOptional()
  @IsString()
  actionUrl?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  expiresAt?: Date;
}

