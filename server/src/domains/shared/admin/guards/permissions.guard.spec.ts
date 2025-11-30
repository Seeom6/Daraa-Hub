import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionsGuard, PERMISSIONS_KEY } from './permissions.guard';
import { AdminService } from '../services/admin.service';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;
  let adminService: AdminService;

  const mockAdminService = {
    findByAccountId: jest.fn(),
  };

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
      providers: [
        PermissionsGuard,
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
        { provide: AdminService, useValue: mockAdminService },
      ],
    }).compile();

    guard = module.get<PermissionsGuard>(PermissionsGuard);
    reflector = module.get<Reflector>(Reflector);
    adminService = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true when no permissions required', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);
      const context = createMockContext({ sub: 'user-123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when empty permissions array', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const context = createMockContext({ sub: 'user-123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when user not authenticated', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([{ resource: 'users', action: 'view' }]);
      const context = createMockContext(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        'User not authenticated',
      );
    });

    it('should throw ForbiddenException when admin profile not found', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([{ resource: 'users', action: 'view' }]);
      mockAdminService.findByAccountId.mockResolvedValue(null);
      const context = createMockContext({ sub: 'user-123' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Admin profile not found',
      );
    });

    it('should return true for super_admin role', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([{ resource: 'users', action: 'delete' }]);
      mockAdminService.findByAccountId.mockResolvedValue({
        role: 'super_admin',
      });
      const context = createMockContext({ sub: 'user-123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should return true when admin has required permission', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([{ resource: 'users', action: 'view' }]);
      mockAdminService.findByAccountId.mockResolvedValue({
        role: 'admin',
        permissions: { users: { view: true } },
      });
      const context = createMockContext({ sub: 'user-123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException when admin lacks permission', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([{ resource: 'users', action: 'delete' }]);
      mockAdminService.findByAccountId.mockResolvedValue({
        role: 'admin',
        permissions: { users: { view: true, delete: false } },
      });
      const context = createMockContext({ sub: 'user-123' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing permission: users.delete',
      );
    });

    it('should throw ForbiddenException when resource not in permissions', async () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([{ resource: 'stores', action: 'view' }]);
      mockAdminService.findByAccountId.mockResolvedValue({
        role: 'admin',
        permissions: { users: { view: true } },
      });
      const context = createMockContext({ sub: 'user-123' });

      await expect(guard.canActivate(context)).rejects.toThrow(
        'Missing permission: stores.view',
      );
    });

    it('should check multiple permissions', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        { resource: 'users', action: 'view' },
        { resource: 'users', action: 'edit' },
      ]);
      mockAdminService.findByAccountId.mockResolvedValue({
        role: 'admin',
        permissions: { users: { view: true, edit: true } },
      });
      const context = createMockContext({ sub: 'user-123' });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
