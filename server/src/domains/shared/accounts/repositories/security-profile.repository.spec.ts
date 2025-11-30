import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SecurityProfileRepository } from './security-profile.repository';
import { SecurityProfile } from '../../../../database/schemas/security-profile.schema';

describe('SecurityProfileRepository', () => {
  let repository: SecurityProfileRepository;
  let mockModel: any;

  const mockSecurityProfile = {
    _id: '507f1f77bcf86cd799439011',
    accountId: '507f1f77bcf86cd799439012',
    failedLoginAttempts: 0,
    lastFailedLoginAt: null,
    twoFactorEnabled: false,
  };

  beforeEach(async () => {
    mockModel = {
      findOne: jest.fn().mockReturnThis(),
      findOneAndUpdate: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SecurityProfileRepository,
        {
          provide: getModelToken(SecurityProfile.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<SecurityProfileRepository>(
      SecurityProfileRepository,
    );
  });

  describe('findByAccountId', () => {
    it('should find security profile by account ID', async () => {
      mockModel.exec.mockResolvedValue(mockSecurityProfile);

      const result = await repository.findByAccountId(
        '507f1f77bcf86cd799439012',
      );

      expect(mockModel.findOne).toHaveBeenCalledWith({
        accountId: '507f1f77bcf86cd799439012',
      });
      expect(result).toEqual(mockSecurityProfile);
    });

    it('should return null if not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      const result = await repository.findByAccountId('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('recordFailedLogin', () => {
    it('should record failed login attempt', async () => {
      const updatedProfile = {
        ...mockSecurityProfile,
        failedLoginAttempts: 1,
        lastFailedLoginAt: new Date(),
      };
      mockModel.exec.mockResolvedValue(updatedProfile);

      const result = await repository.recordFailedLogin(
        '507f1f77bcf86cd799439012',
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { accountId: '507f1f77bcf86cd799439012' },
        {
          $inc: { failedLoginAttempts: 1 },
          $set: { lastFailedLoginAt: expect.any(Date) },
        },
        { new: true, upsert: true },
      );
      expect(result).toEqual(updatedProfile);
    });
  });

  describe('resetFailedLogins', () => {
    it('should reset failed login attempts', async () => {
      const resetProfile = {
        ...mockSecurityProfile,
        failedLoginAttempts: 0,
        lastFailedLoginAt: null,
      };
      mockModel.exec.mockResolvedValue(resetProfile);

      const result = await repository.resetFailedLogins(
        '507f1f77bcf86cd799439012',
      );

      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { accountId: '507f1f77bcf86cd799439012' },
        {
          $set: {
            failedLoginAttempts: 0,
            lastFailedLoginAt: null,
          },
        },
        { new: true },
      );
      expect(result).toEqual(resetProfile);
    });

    it('should return null if profile not found', async () => {
      mockModel.exec.mockResolvedValue(null);

      const result = await repository.resetFailedLogins('nonexistent');

      expect(result).toBeNull();
    });
  });
});
