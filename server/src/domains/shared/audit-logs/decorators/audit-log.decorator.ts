import { SetMetadata } from '@nestjs/common';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../interceptors/audit-log.interceptor';

export const AuditLog = (metadata: AuditLogMetadata) =>
  SetMetadata(AUDIT_LOG_KEY, metadata);

// Helper decorators for common actions
export const AuditUserAction = (action: string, actionType: string, description?: string) =>
  AuditLog({ action, category: 'user', actionType: actionType as any, description });

export const AuditStoreAction = (action: string, actionType: string, description?: string) =>
  AuditLog({ action, category: 'store', actionType: actionType as any, description });

export const AuditCourierAction = (action: string, actionType: string, description?: string) =>
  AuditLog({ action, category: 'courier', actionType: actionType as any, description });

export const AuditOrderAction = (action: string, actionType: string, description?: string) =>
  AuditLog({ action, category: 'order', actionType: actionType as any, description });

export const AuditSecurityAction = (action: string, actionType: string, description?: string) =>
  AuditLog({ action, category: 'security', actionType: actionType as any, description });

