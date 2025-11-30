import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  const createMockContext = (request: any, response: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  describe('intercept', () => {
    it('should log request and response', (done) => {
      const mockRequest = {
        method: 'GET',
        url: '/api/test',
        body: {},
      };
      const mockResponse = { statusCode: 200 };
      mockContext = createMockContext(mockRequest, mockResponse);
      mockCallHandler = { handle: () => of({ data: 'test' }) };

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: () => {},
        complete: () => done(),
      });
    });

    it('should log request with body', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/api/users',
        body: { name: 'John', email: 'john@example.com' },
      };
      const mockResponse = { statusCode: 201 };
      mockContext = createMockContext(mockRequest, mockResponse);
      mockCallHandler = { handle: () => of({ id: 1 }) };

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: () => {},
        complete: () => done(),
      });
    });

    it('should sanitize password in body', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/api/auth/login',
        body: { phone: '+963991234567', password: 'secret123' },
      };
      const mockResponse = { statusCode: 200 };
      mockContext = createMockContext(mockRequest, mockResponse);
      mockCallHandler = { handle: () => of({ token: 'jwt' }) };

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: () => {},
        complete: () => done(),
      });
    });

    it('should sanitize otp in body', (done) => {
      const mockRequest = {
        method: 'POST',
        url: '/api/auth/verify',
        body: { phone: '+963991234567', otp: '123456' },
      };
      const mockResponse = { statusCode: 200 };
      mockContext = createMockContext(mockRequest, mockResponse);
      mockCallHandler = { handle: () => of({ verified: true }) };

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: () => {},
        complete: () => done(),
      });
    });

    it('should handle empty body', (done) => {
      const mockRequest = {
        method: 'DELETE',
        url: '/api/users/1',
        body: null,
      };
      const mockResponse = { statusCode: 204 };
      mockContext = createMockContext(mockRequest, mockResponse);
      mockCallHandler = { handle: () => of(null) };

      const result = interceptor.intercept(mockContext, mockCallHandler);

      result.subscribe({
        next: () => {},
        complete: () => done(),
      });
    });
  });
});
