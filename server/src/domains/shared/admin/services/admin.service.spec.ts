import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminProfileRepository } from '../repositories/admin-profile.repository';
import { generateObjectId } from '../../testing';

describe('AdminService', () => {
  let service: AdminService;

  const mockAdminProfileRepository = {
    create: jest.fn(),
    findByAccountId: jest.fn(),
    findById: jest.fn(),
    findByRole: jest.fn(),
    findByDepartment: jest.fn(),
    findActive: jest.fn(),
    find: jest.fn(),
    updatePermissions: jest.fn(),
    updateRole: jest.fn(),
    toggleActive: jest.fn(),
    logActivity: jest.fn(),
    getActivityLog: jest.fn(),
  };

  const adminId = generateObjectId();
  const accountId = generateObjectId();

  const mockAdmin = {
    _id: adminId,
    accountId,
    role: 'admin',
    department: 'operations',
    isActive: true,
    permissions: {},
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: AdminProfileRepository,
          useValue: mockAdminProfileRepository,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create admin profile', async () => {
      const adminWithSave = {
        ...mockAdmin,
        save: jest.fn().mockResolvedValue(mockAdmin),
      };
      mockAdminProfileRepository.create.mockResolvedValue(adminWithSave);

      const result = await service.create({
        accountId,
        role: 'admin',
        department: 'operations',
        permissions: {},
      } as any);

      expect(result).toBeDefined();
    });
  });

  describe('findByAccountId', () => {
    it('should find admin by account id', async () => {
      mockAdminProfileRepository.findByAccountId.mockResolvedValue(mockAdmin);

      const result = await service.findByAccountId(accountId);

      expect(result).toEqual(mockAdmin);
    });
  });

  describe('findById', () => {
    it('should find admin by id', async () => {
      mockAdminProfileRepository.findById.mockResolvedValue(mockAdmin);

      const result = await service.findById(adminId);

      expect(result).toEqual(mockAdmin);
    });

    it('should throw if not found', async () => {
      mockAdminProfileRepository.findById.mockResolvedValue(null);

      await expect(service.findById(adminId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should find all admins', async () => {
      mockAdminProfileRepository.find.mockResolvedValue([mockAdmin]);

      const result = await service.findAll();

      expect(result).toEqual([mockAdmin]);
    });

    it('should filter by role', async () => {
      mockAdminProfileRepository.findByRole.mockResolvedValue([mockAdmin]);

      const result = await service.findAll({ role: 'admin' });

      expect(result).toEqual([mockAdmin]);
    });
  });

  describe('updatePermissions', () => {
    it('should update permissions', async () => {
      mockAdminProfileRepository.updatePermissions.mockResolvedValue(mockAdmin);

      const result = await service.updatePermissions(adminId, {
        users: { view: true },
      });

      expect(result).toEqual(mockAdmin);
    });

    it('should throw if not found', async () => {
      mockAdminProfileRepository.updatePermissions.mockResolvedValue(null);

      await expect(service.updatePermissions(adminId, {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRole', () => {
    it('should update role', async () => {
      mockAdminProfileRepository.updateRole.mockResolvedValue({
        ...mockAdmin,
        role: 'super_admin',
      });

      const result = await service.updateRole(adminId, 'super_admin');

      expect(result.role).toBe('super_admin');
    });
  });

  describe('deactivate', () => {
    it('should deactivate admin', async () => {
      mockAdminProfileRepository.toggleActive.mockResolvedValue({
        ...mockAdmin,
        isActive: false,
      });

      const result = await service.deactivate(adminId);

      expect(result.isActive).toBe(false);
    });
  });

  describe('getDefaultPermissions', () => {
    it('should return super_admin permissions', () => {
      const permissions = AdminService.getDefaultPermissions('super_admin');

      expect(permissions.users.delete).toBe(true);
    });

    it('should return admin permissions', () => {
      const permissions = AdminService.getDefaultPermissions('admin');

      expect(permissions.users.delete).toBe(false);
      expect(permissions.users.view).toBe(true);
    });

    it('should return moderator permissions', () => {
      const permissions = AdminService.getDefaultPermissions('moderator');

      expect(permissions.users.create).toBe(false);
      expect(permissions.products.view).toBe(true);
    });

    it('should return support permissions', () => {
      const permissions = AdminService.getDefaultPermissions('support');

      expect(permissions.users.view).toBe(true);
      expect(permissions.settings.view).toBe(false);
    });

    it('should return empty for unknown role', () => {
      const permissions = AdminService.getDefaultPermissions('unknown');

      expect(permissions).toEqual({});
    });
  });

  describe('findAll with filters', () => {
    it('should filter by department', async () => {
      mockAdminProfileRepository.findByDepartment.mockResolvedValue([
        mockAdmin,
      ]);

      const result = await service.findAll({ department: 'operations' });

      expect(mockAdminProfileRepository.findByDepartment).toHaveBeenCalledWith(
        'operations',
      );
      expect(result).toEqual([mockAdmin]);
    });

    it('should filter by isActive', async () => {
      mockAdminProfileRepository.findActive.mockResolvedValue([mockAdmin]);

      const result = await service.findAll({ isActive: true });

      expect(mockAdminProfileRepository.findActive).toHaveBeenCalled();
      expect(result).toEqual([mockAdmin]);
    });
  });

  describe('updateRole error handling', () => {
    it('should throw if admin not found', async () => {
      mockAdminProfileRepository.updateRole.mockResolvedValue(null);

      await expect(service.updateRole(adminId, 'super_admin')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deactivate error handling', () => {
    it('should throw if admin not found', async () => {
      mockAdminProfileRepository.toggleActive.mockResolvedValue(null);

      await expect(service.deactivate(adminId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activate', () => {
    it('should activate admin', async () => {
      mockAdminProfileRepository.toggleActive.mockResolvedValue({
        ...mockAdmin,
        isActive: true,
      });

      const result = await service.activate(adminId);

      expect(result.isActive).toBe(true);
      expect(mockAdminProfileRepository.toggleActive).toHaveBeenCalledWith(
        adminId,
        true,
      );
    });

    it('should throw if admin not found', async () => {
      mockAdminProfileRepository.toggleActive.mockResolvedValue(null);

      await expect(service.activate(adminId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('logActivity', () => {
    it('should log admin activity', async () => {
      mockAdminProfileRepository.logActivity.mockResolvedValue(undefined);

      await service.logActivity(
        accountId,
        'login',
        { browser: 'Chrome' },
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(mockAdminProfileRepository.logActivity).toHaveBeenCalledWith(
        accountId,
        expect.objectContaining({
          action: 'login',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
        true, // isLogin = true for 'login' action
      );
    });

    it('should log non-login activity', async () => {
      mockAdminProfileRepository.logActivity.mockResolvedValue(undefined);

      await service.logActivity(accountId, 'update_user', { userId: '123' });

      expect(mockAdminProfileRepository.logActivity).toHaveBeenCalledWith(
        accountId,
        expect.objectContaining({
          action: 'update_user',
        }),
        false, // isLogin = false for non-login actions
      );
    });
  });

  describe('getActivityLog', () => {
    it('should return activity log', async () => {
      const activityLog = [{ action: 'login', timestamp: new Date() }];
      mockAdminProfileRepository.getActivityLog.mockResolvedValue(activityLog);

      const result = await service.getActivityLog(accountId);

      expect(result).toEqual(activityLog);
    });

    it('should throw if admin not found and no activity', async () => {
      mockAdminProfileRepository.getActivityLog.mockResolvedValue([]);
      mockAdminProfileRepository.findByAccountId.mockResolvedValue(null);

      await expect(service.getActivityLog(accountId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return empty array if admin exists but no activity', async () => {
      mockAdminProfileRepository.getActivityLog.mockResolvedValue([]);
      mockAdminProfileRepository.findByAccountId.mockResolvedValue(mockAdmin);

      const result = await service.getActivityLog(accountId);

      expect(result).toEqual([]);
    });

    it('should use custom limit', async () => {
      mockAdminProfileRepository.getActivityLog.mockResolvedValue([]);
      mockAdminProfileRepository.findByAccountId.mockResolvedValue(mockAdmin);

      await service.getActivityLog(accountId, 100);

      expect(mockAdminProfileRepository.getActivityLog).toHaveBeenCalledWith(
        accountId,
        100,
      );
    });
  });
});
