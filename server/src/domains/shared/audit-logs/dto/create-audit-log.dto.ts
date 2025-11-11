import { IsString, IsEnum, IsOptional, IsObject } from 'class-validator';

export class CreateAuditLogDto {
  @IsString()
  performedBy: string;

  @IsString()
  action: string;

  @IsEnum(['user', 'store', 'courier', 'product', 'order', 'payment', 'system', 'security'])
  category: 'user' | 'store' | 'courier' | 'product' | 'order' | 'payment' | 'system' | 'security';

  @IsEnum(['create', 'read', 'update', 'delete', 'approve', 'reject', 'suspend', 'other'])
  actionType: 'create' | 'read' | 'update' | 'delete' | 'approve' | 'reject' | 'suspend' | 'other';

  @IsOptional()
  @IsString()
  targetId?: string;

  @IsOptional()
  @IsString()
  targetModel?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsObject()
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @IsString()
  ipAddress: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsEnum(['success', 'failure', 'warning'])
  status?: 'success' | 'failure' | 'warning';

  @IsOptional()
  @IsString()
  errorMessage?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

