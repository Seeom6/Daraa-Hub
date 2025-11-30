import { Test, TestingModule } from '@nestjs/testing';
import { StoreCategoryCacheService } from './store-category-cache.service';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { generateObjectId } from '../../testing';

describe('StoreCategoryCacheService', () => {
  let service: StoreCategoryCacheService;
  let mockRedisService: any;

  const mockCategory = {
    _id: generateObjectId(),
    name: 'Electronics',
    nameAr: 'إلكترونيات',
    isActive: true,
  };

  beforeEach(async () => {
    mockRedisService = {
      set: jest.fn().mockResolvedValue('OK'),
      get: jest.fn().mockResolvedValue(JSON.stringify(mockCategory)),
      del: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreCategoryCacheService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<StoreCategoryCacheService>(StoreCategoryCacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cacheCategory', () => {
    it('should cache category', async () => {
      await service.cacheCategory(mockCategory);

      expect(mockRedisService.set).toHaveBeenCalledWith(
        `store-category:${mockCategory._id}`,
        JSON.stringify(mockCategory),
        3600,
      );
    });

    it('should handle cache error gracefully', async () => {
      mockRedisService.set.mockRejectedValue(new Error('Redis error'));

      await expect(service.cacheCategory(mockCategory)).resolves.not.toThrow();
    });
  });

  describe('getCachedCategory', () => {
    it('should return cached category', async () => {
      const result = await service.getCachedCategory(mockCategory._id);

      expect(result).toEqual(mockCategory);
    });

    it('should return null if not cached', async () => {
      mockRedisService.get.mockResolvedValue(null);

      const result = await service.getCachedCategory(generateObjectId());

      expect(result).toBeNull();
    });

    it('should handle error gracefully', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.getCachedCategory(generateObjectId());

      expect(result).toBeNull();
    });
  });

  describe('deleteCachedCategory', () => {
    it('should delete cached category', async () => {
      await service.deleteCachedCategory(mockCategory._id);

      expect(mockRedisService.del).toHaveBeenCalled();
    });

    it('should handle error gracefully', async () => {
      mockRedisService.del.mockRejectedValue(new Error('Redis error'));

      await expect(
        service.deleteCachedCategory(mockCategory._id),
      ).resolves.not.toThrow();
    });
  });

  describe('clearAllCategoriesCache', () => {
    it('should clear all categories cache', async () => {
      await service.clearAllCategoriesCache();

      expect(mockRedisService.del).toHaveBeenCalledTimes(2);
    });

    it('should handle error gracefully', async () => {
      mockRedisService.del.mockRejectedValue(new Error('Redis error'));

      await expect(service.clearAllCategoriesCache()).resolves.not.toThrow();
    });
  });
});
