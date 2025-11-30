import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserManagementService } from './user-management.service';
import { Account } from '../../../../database/schemas/account.schema';
import { generateObjectId } from '../../testing';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let mockModel: any;
  let mockEventEmitter: any;

  const userId = generateObjectId();
  const adminId = generateObjectId();
  const mockUser = {
    _id: userId,
    fullName: 'Test User',
    phone: '+963991234567',
    role: 'customer',
    isActive: true,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockModel = {
      find: jest.fn().mockReturnValue({
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockUser]),
      }),
      findById: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      }),
      countDocuments: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        { provide: getModelToken(Account.name), useValue: mockModel },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllUsers', () => {
    it('should return paginated users', async () => {
      const result = await service.findAllUsers({ page: 1, limit: 10 });

      expect(result.users).toEqual([mockUser]);
      expect(result.total).toBe(1);
    });

    it('should filter by role', async () => {
      await service.findAllUsers({ role: 'customer' });

      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('findUserById', () => {
    it('should return user by id', async () => {
      const result = await service.findUserById(userId);

      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if not found', async () => {
      mockModel.findById.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findUserById(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('suspendUser', () => {
    it('should suspend user', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.suspendUser(
        userId,
        { reason: 'Violation', durationDays: 7 },
        adminId,
      );

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });

    it('should throw NotFoundException if user not found', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.suspendUser(userId, { reason: 'Test' }, adminId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('unsuspendUser', () => {
    it('should unsuspend user', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.unsuspendUser(userId, { reason: 'Resolved' }, adminId);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });
  });

  describe('banUser', () => {
    it('should ban user permanently', async () => {
      mockModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      await service.banUser(userId, 'Severe violation', adminId);

      expect(mockUser.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalled();
    });
  });

  describe('searchUsers', () => {
    it('should search users by query', async () => {
      mockModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockUser]),
      });

      const result = await service.searchUsers('Test');

      expect(result).toEqual([mockUser]);
    });
  });
});
