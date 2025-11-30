import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { AuditLogInterceptor, AUDIT_LOG_KEY } from './audit-log.interceptor';
import { AuditLogsService } from '../services/audit-logs.service';

describe('AuditLogInterceptor', () => {
  let interceptor: AuditLogInterceptor;
  let reflector: jest.Mocked<Reflector>;
  let auditLogsService: jest.Mocked<AuditLogsService>;

  const mockRequest = {
    user: { sub: 'user123' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test-agent' },
    method: 'POST',
    url: '/api/test',
    params: { id: '1' },
    query: { page: '1' },
    connection: { remoteAddress: '127.0.0.1' },
  };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
    getHandler: () => jest.fn(),
  } as unknown as ExecutionContext;

  const mockCallHandler: CallHandler = {
    handle: () => of({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogInterceptor,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: AuditLogsService,
          useValue: {
            log: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    interceptor = module.get<AuditLogInterceptor>(AuditLogInterceptor);
    reflector = module.get(Reflector);
    auditLogsService = module.get(AuditLogsService);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should pass through if no audit metadata', (done) => {
      reflector.get.mockReturnValue(undefined);

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({ success: true });
          expect(auditLogsService.log).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should pass through if no user', (done) => {
      reflector.get.mockReturnValue({
        action: 'test',
        category: 'user',
        actionType: 'create',
      });

      const noUserContext = {
        switchToHttp: () => ({
          getRequest: () => ({ ...mockRequest, user: null }),
        }),
        getHandler: () => jest.fn(),
      } as unknown as ExecutionContext;

      interceptor.intercept(noUserContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toEqual({ success: true });
          expect(auditLogsService.log).not.toHaveBeenCalled();
          done();
        },
      });
    });

    it('should log successful action', (done) => {
      reflector.get.mockReturnValue({
        action: 'test_action',
        category: 'user',
        actionType: 'create',
        description: 'Test description',
      });

      interceptor.intercept(mockContext, mockCallHandler).subscribe({
        next: () => {
          setTimeout(() => {
            expect(auditLogsService.log).toHaveBeenCalledWith(
              'user123',
              'test_action',
              'user',
              'create',
              '127.0.0.1',
              expect.objectContaining({
                status: 'success',
                description: 'Test description',
              }),
            );
            done();
          }, 10);
        },
      });
    });

    it('should log failed action and rethrow error', (done) => {
      reflector.get.mockReturnValue({
        action: 'test_action',
        category: 'user',
        actionType: 'create',
      });

      const errorHandler: CallHandler = {
        handle: () => throwError(() => new Error('Test error')),
      };

      interceptor.intercept(mockContext, errorHandler).subscribe({
        error: (err) => {
          expect(err.message).toBe('Test error');
          setTimeout(() => {
            expect(auditLogsService.log).toHaveBeenCalledWith(
              'user123',
              'test_action',
              'user',
              'create',
              '127.0.0.1',
              expect.objectContaining({
                status: 'failure',
                errorMessage: 'Test error',
              }),
            );
            done();
          }, 10);
        },
      });
    });
  });
});
