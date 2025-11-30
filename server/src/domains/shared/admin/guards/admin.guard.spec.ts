import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  const createMockContext = (user?: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard, { provide: Reflector, useValue: {} }],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  describe('canActivate', () => {
    it('should return true for admin users', () => {
      const context = createMockContext({ role: 'admin' });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user is not authenticated', () => {
      const context = createMockContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'User not authenticated',
      );
    });

    it('should throw ForbiddenException when user is not admin', () => {
      const context = createMockContext({ role: 'customer' });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Admin role required.',
      );
    });

    it('should throw ForbiddenException for store_owner role', () => {
      const context = createMockContext({ role: 'store_owner' });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException for courier role', () => {
      const context = createMockContext({ role: 'courier' });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });
});
