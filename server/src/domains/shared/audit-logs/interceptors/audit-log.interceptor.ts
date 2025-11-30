import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditLogsService } from '../services/audit-logs.service';

export const AUDIT_LOG_KEY = 'audit_log';

export interface AuditLogMetadata {
  action: string;
  category:
    | 'user'
    | 'store'
    | 'courier'
    | 'product'
    | 'order'
    | 'payment'
    | 'system'
    | 'security';
  actionType:
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'approve'
    | 'reject'
    | 'suspend'
    | 'other';
  description?: string;
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private reflector: Reflector,
    private auditLogsService: AuditLogsService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditMetadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return next.handle();
    }

    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.auditLogsService.log(
            user.sub,
            auditMetadata.action,
            auditMetadata.category,
            auditMetadata.actionType,
            ipAddress,
            {
              userAgent,
              status: 'success',
              description: auditMetadata.description,
              metadata: {
                method: request.method,
                url: request.url,
                params: request.params,
                query: request.query,
              },
            },
          );
        } catch (error) {
          this.logger.error('Failed to create audit log', error);
        }
      }),
      catchError(async (error) => {
        try {
          await this.auditLogsService.log(
            user.sub,
            auditMetadata.action,
            auditMetadata.category,
            auditMetadata.actionType,
            ipAddress,
            {
              userAgent,
              status: 'failure',
              errorMessage: error.message,
              description: auditMetadata.description,
              metadata: {
                method: request.method,
                url: request.url,
                params: request.params,
                query: request.query,
              },
            },
          );
        } catch (logError) {
          this.logger.error('Failed to create audit log for error', logError);
        }
        throw error;
      }),
    );
  }
}
