import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DeviceTokenService } from './device-token.service';
import { DeviceToken } from '../../../../database/schemas/device-token.schema';
import { generateObjectId } from '../../testing';

describe('DeviceTokenService', () => {
  let service: DeviceTokenService;
  let mockModel: any;

  const userId = generateObjectId();
  const mockToken = {
    _id: generateObjectId(),
    userId,
    token: 'device-token-123',
    platform: 'android',
    isActive: true,
    save: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    mockModel = jest.fn().mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(mockToken),
    }));
    mockModel.findOne = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    mockModel.find = jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue([mockToken]) });
    mockModel.updateOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    });
    mockModel.deleteOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    });
    mockModel.deleteMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({ deletedCount: 5 }),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceTokenService,
        { provide: getModelToken(DeviceToken.name), useValue: mockModel },
      ],
    }).compile();

    service = module.get<DeviceTokenService>(DeviceTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerToken', () => {
    it('should create new token if not exists', async () => {
      const registerDto = {
        token: 'new-token',
        platform: 'android' as const,
        deviceInfo: {},
      };

      await service.registerToken(userId, registerDto);

      expect(mockModel).toHaveBeenCalled();
    });

    it('should update existing token', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockToken),
      });
      const registerDto = {
        token: 'device-token-123',
        platform: 'ios' as const,
        deviceInfo: {},
      };

      await service.registerToken(userId, registerDto);

      expect(mockToken.save).toHaveBeenCalled();
    });
  });

  describe('getUserTokens', () => {
    it('should return user tokens', async () => {
      const result = await service.getUserTokens(userId);

      expect(result).toEqual([mockToken]);
      expect(mockModel.find).toHaveBeenCalled();
    });
  });

  describe('getUserTokensByPlatform', () => {
    it('should return tokens by platform', async () => {
      const result = await service.getUserTokensByPlatform(userId, 'android');

      expect(result).toEqual([mockToken]);
    });
  });

  describe('deactivateToken', () => {
    it('should deactivate token', async () => {
      await service.deactivateToken(mockToken._id, userId);

      expect(mockModel.updateOne).toHaveBeenCalled();
    });

    it('should throw if token not found', async () => {
      mockModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 0 }),
      });

      await expect(
        service.deactivateToken('invalid', userId),
      ).rejects.toThrow();
    });
  });

  describe('deleteToken', () => {
    it('should delete token', async () => {
      await service.deleteToken(mockToken._id, userId);

      expect(mockModel.deleteOne).toHaveBeenCalled();
    });

    it('should throw if token not found', async () => {
      mockModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(service.deleteToken('invalid', userId)).rejects.toThrow();
    });
  });

  describe('updateLastUsed', () => {
    it('should update last used timestamp', async () => {
      await service.updateLastUsed(mockToken._id);

      expect(mockModel.updateOne).toHaveBeenCalled();
    });
  });

  describe('markAsInvalid', () => {
    it('should mark token as invalid', async () => {
      await service.markAsInvalid('some-token');

      expect(mockModel.updateOne).toHaveBeenCalled();
    });
  });

  describe('cleanupInactiveTokens', () => {
    it('should cleanup inactive tokens', async () => {
      const result = await service.cleanupInactiveTokens(90);

      expect(result).toBe(5);
      expect(mockModel.deleteMany).toHaveBeenCalled();
    });
  });
});
