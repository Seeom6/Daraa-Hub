import { Test, TestingModule } from '@nestjs/testing';
import { SettingsCacheService } from './settings-cache.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

describe('SettingsCacheService', () => {
  let service: SettingsCacheService;
  let mockRedisService: any;

  const mockSettings = {
    key: 'general',
    category: 'general',
    value: { platformName: 'Daraa' },
  };

  beforeEach(async () => {
    mockRedisService = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(JSON.stringify(mockSettings)),
      del: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsCacheService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<SettingsCacheService>(SettingsCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheSettings', () => {
    it('should cache settings', async () => {
      await service.cacheSettings('general', mockSettings as any);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        'settings:general',
        JSON.stringify(mockSettings),
        3600,
      );
    });

    it('should handle cache errors gracefully', async () => {
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));

      await expect(
        service.cacheSettings('general', mockSettings as any),
      ).resolves.not.toThrow();
    });
  });

  describe('getCachedSettings', () => {
    it('should return cached settings', async () => {
      const result = await service.getCachedSettings('general');

      expect(result).toEqual(mockSettings);
    });

    it('should return null if not cached', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.getCachedSettings('general');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.getCachedSettings('general');

      expect(result).toBeNull();
    });
  });

  describe('deleteCachedSettings', () => {
    it('should delete cached settings', async () => {
      await service.deleteCachedSettings('general');

      expect(mockRedisService.del).toHaveBeenCalledWith('settings:general');
    });

    it('should handle errors gracefully', async () => {
      mockRedisService.del.mockRejectedValue(new Error('Redis error'));

      await expect(
        service.deleteCachedSettings('general'),
      ).resolves.not.toThrow();
    });
  });
});
