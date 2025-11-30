import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from '../services/admin.service';
import { UserManagementService } from '../services/user-management.service';
import { generateObjectId } from '../../testing';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { PermissionsGuard } from '../guards/permissions.guard';

describe('AdminController', () => {
  let controller: AdminController;

  const mockAdminService = {
    findByAccountId: jest.fn(),
    getActivityLog: jest.fn(),
    logActivity: jest.fn(),
  };

  const mockUserManagementService = {
    findAllUsers: jest.fn(),
    searchUsers: jest.fn(),
    findUserById: jest.fn(),
    getUserActivity: jest.fn(),
    suspendUser: jest.fn(),
    unsuspendUser: jest.fn(),
    banUser: jest.fn(),
  };

  const accountId = generateObjectId();
  const userId = generateObjectId();
  const mockRequest = {
    user: { sub: accountId },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'test' },
  };

  const mockAdmin = {
    _id: generateObjectId(),
    accountId,
    role: 'admin',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: UserManagementService, useValue: mockUserManagementService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyProfile', () => {
    it('should return admin profile', async () => {
      mockAdminService.findByAccountId.mockResolvedValue(mockAdmin);

      const result = await controller.getMyProfile(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAdmin);
    });
  });

  describe('getMyActivityLog', () => {
    it('should return activity log', async () => {
      const activityLog = [{ action: 'login', timestamp: new Date() }];
      mockAdminService.getActivityLog.mockResolvedValue(activityLog);

      const result = await controller.getMyActivityLog(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(activityLog);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = { data: [], total: 0, page: 1, limit: 20 };
      mockUserManagementService.findAllUsers.mockResolvedValue(users);

      const result = await controller.getAllUsers();

      expect(result.success).toBe(true);
    });
  });

  describe('searchUsers', () => {
    it('should search users', async () => {
      mockUserManagementService.searchUsers.mockResolvedValue([]);

      const result = await controller.searchUsers('test');

      expect(result.success).toBe(true);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = { _id: userId, fullName: 'Test User' };
      mockUserManagementService.findUserById.mockResolvedValue(user);

      const result = await controller.getUserById(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(user);
    });
  });

  describe('suspendUser', () => {
    it('should suspend user', async () => {
      const suspendDto = { reason: 'Violation', durationDays: 7 };
      mockUserManagementService.suspendUser.mockResolvedValue({
        _id: userId,
        isSuspended: true,
      });

      const result = await controller.suspendUser(
        userId,
        suspendDto as any,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('User suspended successfully');
    });
  });

  describe('unsuspendUser', () => {
    it('should unsuspend user', async () => {
      const unsuspendDto = { reason: 'Appeal approved' };
      mockUserManagementService.unsuspendUser.mockResolvedValue({
        _id: userId,
        isSuspended: false,
      });

      const result = await controller.unsuspendUser(
        userId,
        unsuspendDto as any,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('User unsuspended successfully');
    });
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats', async () => {
      const result = await controller.getDashboardStats();

      expect(result.success).toBe(true);
      expect(result.data.totalUsers).toBeDefined();
    });
  });

  describe('getMyActivityLog with custom limit', () => {
    it('should use custom limit when provided', async () => {
      const activityLog = [{ action: 'login' }];
      mockAdminService.getActivityLog.mockResolvedValue(activityLog);

      await controller.getMyActivityLog(mockRequest, 100);

      expect(mockAdminService.getActivityLog).toHaveBeenCalledWith(
        accountId,
        100,
      );
    });

    it('should use default limit when not provided', async () => {
      mockAdminService.getActivityLog.mockResolvedValue([]);

      await controller.getMyActivityLog(mockRequest);

      expect(mockAdminService.getActivityLog).toHaveBeenCalledWith(
        accountId,
        50,
      );
    });
  });

  describe('getAllUsers with filters', () => {
    it('should filter by role', async () => {
      mockUserManagementService.findAllUsers.mockResolvedValue({
        data: [],
        total: 0,
      });

      await controller.getAllUsers('customer');

      expect(mockUserManagementService.findAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'customer',
        }),
      );
    });

    it('should filter by isActive true', async () => {
      mockUserManagementService.findAllUsers.mockResolvedValue({
        data: [],
        total: 0,
      });

      await controller.getAllUsers(undefined, 'true');

      expect(mockUserManagementService.findAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
        }),
      );
    });

    it('should filter by isActive false', async () => {
      mockUserManagementService.findAllUsers.mockResolvedValue({
        data: [],
        total: 0,
      });

      await controller.getAllUsers(undefined, 'false');

      expect(mockUserManagementService.findAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
        }),
      );
    });

    it('should filter by isVerified true', async () => {
      mockUserManagementService.findAllUsers.mockResolvedValue({
        data: [],
        total: 0,
      });

      await controller.getAllUsers(undefined, undefined, 'true');

      expect(mockUserManagementService.findAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: true,
        }),
      );
    });

    it('should filter by isVerified false', async () => {
      mockUserManagementService.findAllUsers.mockResolvedValue({
        data: [],
        total: 0,
      });

      await controller.getAllUsers(undefined, undefined, 'false');

      expect(mockUserManagementService.findAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          isVerified: false,
        }),
      );
    });

    it('should use custom page and limit', async () => {
      mockUserManagementService.findAllUsers.mockResolvedValue({
        data: [],
        total: 0,
      });

      await controller.getAllUsers(undefined, undefined, undefined, '2', '50');

      expect(mockUserManagementService.findAllUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
          limit: 50,
        }),
      );
    });
  });

  describe('getUserActivity', () => {
    it('should return user activity', async () => {
      const activity = [{ action: 'order_placed', timestamp: new Date() }];
      mockUserManagementService.getUserActivity.mockResolvedValue(activity);

      const result = await controller.getUserActivity(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(activity);
    });
  });

  describe('banUser', () => {
    it('should ban user permanently', async () => {
      mockUserManagementService.banUser.mockResolvedValue({
        _id: userId,
        isBanned: true,
      });

      const result = await controller.banUser(
        userId,
        'Severe violation',
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('User banned permanently');
      expect(mockAdminService.logActivity).toHaveBeenCalledWith(
        accountId,
        'ban_user',
        { userId, reason: 'Severe violation' },
        '127.0.0.1',
        'test',
      );
    });
  });
});
