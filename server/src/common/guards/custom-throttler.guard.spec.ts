import { ExecutionContext } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerModuleOptions,
  ThrottlerStorage,
} from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { CustomThrottlerGuard } from './custom-throttler.guard';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;
  let mockReflector: Reflector;
  let mockStorage: ThrottlerStorage;
  let mockOptions: ThrottlerModuleOptions;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as any;

    mockStorage = {
      increment: jest.fn(),
      get: jest.fn(),
    } as any;

    mockOptions = {
      throttlers: [{ ttl: 60000, limit: 10 }],
    };

    guard = new CustomThrottlerGuard(mockOptions, mockStorage, mockReflector);
  });

  describe('getTracker', () => {
    it('should return tracker with IP and user ID', async () => {
      const mockRequest = {
        ip: '192.168.1.1',
        user: { userId: 'user123' },
      };

      const tracker = await (guard as any).getTracker(mockRequest);

      expect(tracker).toBe('192.168.1.1-user123');
    });

    it('should use connection.remoteAddress when ip is not available', async () => {
      const mockRequest = {
        connection: { remoteAddress: '10.0.0.1' },
        user: { userId: 'user456' },
      };

      const tracker = await (guard as any).getTracker(mockRequest);

      expect(tracker).toBe('10.0.0.1-user456');
    });

    it('should use anonymous when user is not authenticated', async () => {
      const mockRequest = {
        ip: '192.168.1.1',
      };

      const tracker = await (guard as any).getTracker(mockRequest);

      expect(tracker).toBe('192.168.1.1-anonymous');
    });

    it('should use unknown when no IP is available', async () => {
      const mockRequest = {
        user: { userId: 'user789' },
      };

      const tracker = await (guard as any).getTracker(mockRequest);

      expect(tracker).toBe('unknown-user789');
    });

    it('should handle completely empty request', async () => {
      const mockRequest = {};

      const tracker = await (guard as any).getTracker(mockRequest);

      expect(tracker).toBe('unknown-anonymous');
    });
  });

  describe('throwThrottlingException', () => {
    it('should throw ThrottlerException with tracker info', async () => {
      const mockRequest = {
        ip: '192.168.1.1',
        user: { userId: 'user123' },
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(
        (guard as any).throwThrottlingException(mockContext),
      ).rejects.toThrow(ThrottlerException);

      await expect(
        (guard as any).throwThrottlingException(mockContext),
      ).rejects.toThrow(
        'Too many requests from 192.168.1.1-user123. Please try again later.',
      );
    });

    it('should include anonymous in message for unauthenticated users', async () => {
      const mockRequest = {
        ip: '10.0.0.1',
      };

      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      await expect(
        (guard as any).throwThrottlingException(mockContext),
      ).rejects.toThrow(
        'Too many requests from 10.0.0.1-anonymous. Please try again later.',
      );
    });
  });
});
