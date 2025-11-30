import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdminProfileRepository } from './admin-profile.repository';
import { AdminProfile } from '../../../../database/schemas/admin-profile.schema';

describe('AdminProfileRepository', () => {
  let repository: AdminProfileRepository;
  let mockModel: Partial<Model<any>>;

  const mockAdminProfile = {
    _id: '507f1f77bcf86cd799439011',
    accountId: new Types.ObjectId('507f1f77bcf86cd799439012'),
    role: 'admin',
    department: 'IT',
    isActive: true,
    permissions: { users: { read: true, write: true } },
    activityLog: [
      { action: 'login', timestamp: new Date() },
      { action: 'update_user', timestamp: new Date() },
    ],
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAdminProfile),
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockAdminProfile),
        }),
      }),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([mockAdminProfile]),
        }),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAdminProfile),
      }),
      findOneAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAdminProfile),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProfileRepository,
        {
          provide: getModelToken(AdminProfile.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<AdminProfileRepository>(AdminProfileRepository);
  });

  describe('findByAccountId', () => {
    it('should find admin profile by account ID', async () => {
      const result = await repository.findByAccountId(
        '507f1f77bcf86cd799439012',
      );

      expect(mockModel.findOne).toHaveBeenCalledWith({
        accountId: expect.any(Types.ObjectId),
      });
      expect(result).toEqual(mockAdminProfile);
    });
  });

  describe('findByRole', () => {
    it('should find admins by role', async () => {
      const result = await repository.findByRole('admin');

      expect(mockModel.find).toHaveBeenCalledWith({ role: 'admin' });
      expect(result).toEqual([mockAdminProfile]);
    });

    it('should find super_admin role', async () => {
      await repository.findByRole('super_admin');
      expect(mockModel.find).toHaveBeenCalledWith({ role: 'super_admin' });
    });
  });

  describe('findByDepartment', () => {
    it('should find admins by department', async () => {
      const result = await repository.findByDepartment('IT');

      expect(mockModel.find).toHaveBeenCalledWith({ department: 'IT' });
      expect(result).toEqual([mockAdminProfile]);
    });
  });

  describe('findActive', () => {
    it('should find active admins', async () => {
      const result = await repository.findActive();

      expect(mockModel.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual([mockAdminProfile]);
    });
  });

  describe('updatePermissions', () => {
    it('should update admin permissions', async () => {
      const newPermissions = { users: { read: true, write: false } };
      const result = await repository.updatePermissions(
        '507f1f77bcf86cd799439011',
        newPermissions,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { permissions: newPermissions },
        { new: true },
      );
      expect(result).toEqual(mockAdminProfile);
    });
  });

  describe('updateRole', () => {
    it('should update admin role', async () => {
      const result = await repository.updateRole(
        '507f1f77bcf86cd799439011',
        'super_admin',
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { role: 'super_admin' },
        { new: true },
      );
      expect(result).toEqual(mockAdminProfile);
    });
  });

  describe('toggleActive', () => {
    it('should toggle admin active status to true', async () => {
      const result = await repository.toggleActive(
        '507f1f77bcf86cd799439011',
        true,
      );

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { isActive: true },
        { new: true },
      );
      expect(result).toEqual(mockAdminProfile);
    });

    it('should toggle admin active status to false', async () => {
      await repository.toggleActive('507f1f77bcf86cd799439011', false);

      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { isActive: false },
        { new: true },
      );
    });
  });

  describe('logActivity', () => {
    it('should log activity without login', async () => {
      const activity = {
        action: 'update_user',
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
      };

      await repository.logActivity('507f1f77bcf86cd799439012', activity);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { accountId: expect.any(Types.ObjectId) },
        { $push: { activityLog: activity } },
      );
    });

    it('should log activity with login flag', async () => {
      const activity = {
        action: 'login',
        timestamp: new Date(),
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
      };

      await repository.logActivity('507f1f77bcf86cd799439012', activity, true);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { accountId: expect.any(Types.ObjectId) },
        expect.objectContaining({
          $push: { activityLog: activity },
          lastLoginAt: expect.any(Date),
        }),
      );
    });

    it('should log activity with details', async () => {
      const activity = {
        action: 'update_settings',
        timestamp: new Date(),
        details: { setting: 'theme', value: 'dark' },
      };

      await repository.logActivity('507f1f77bcf86cd799439012', activity);

      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('getActivityLog', () => {
    it('should get activity log with default limit', async () => {
      const result = await repository.getActivityLog(
        '507f1f77bcf86cd799439012',
      );

      expect(mockModel.findOne).toHaveBeenCalledWith({
        accountId: expect.any(Types.ObjectId),
      });
      expect(result).toHaveLength(2);
    });

    it('should get activity log with custom limit', async () => {
      const result = await repository.getActivityLog(
        '507f1f77bcf86cd799439012',
        10,
      );

      expect(mockModel.findOne).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });

    it('should return empty array when admin not found', async () => {
      mockModel.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await repository.getActivityLog(
        '507f1f77bcf86cd799439012',
      );

      expect(result).toEqual([]);
    });
  });

  describe('findByAccountId when not found', () => {
    it('should return null when admin not found', async () => {
      mockModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByAccountId(
        '507f1f77bcf86cd799439099',
      );

      expect(result).toBeNull();
    });
  });

  describe('findByRole with all roles', () => {
    it('should find moderator role', async () => {
      await repository.findByRole('moderator');
      expect(mockModel.find).toHaveBeenCalledWith({ role: 'moderator' });
    });

    it('should find support role', async () => {
      await repository.findByRole('support');
      expect(mockModel.find).toHaveBeenCalledWith({ role: 'support' });
    });
  });

  describe('updateRole with all roles', () => {
    it('should update to moderator role', async () => {
      await repository.updateRole('507f1f77bcf86cd799439011', 'moderator');
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { role: 'moderator' },
        { new: true },
      );
    });

    it('should update to support role', async () => {
      await repository.updateRole('507f1f77bcf86cd799439011', 'support');
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        { role: 'support' },
        { new: true },
      );
    });
  });
});
