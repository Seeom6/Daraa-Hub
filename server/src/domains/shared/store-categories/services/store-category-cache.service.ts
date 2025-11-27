import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../../../../infrastructure/redis/redis.service';
import { StoreCategory } from '../../../../database/schemas/store-category.schema';

/**
 * Store Category Cache Service
 * Handles caching operations for store categories
 */
@Injectable()
export class StoreCategoryCacheService {
  private readonly logger = new Logger(StoreCategoryCacheService.name);
  private readonly CACHE_PREFIX = 'store-category:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(private redisService: RedisService) {}

  /**
   * حفظ تصنيف في الـ cache
   */
  async cacheCategory(category: any): Promise<void> {
    try {
      const key = `${this.CACHE_PREFIX}${category._id}`;
      await this.redisService.set(
        key,
        JSON.stringify(category),
        this.CACHE_TTL,
      );
    } catch (error) {
      this.logger.warn(`Failed to cache category: ${category._id}`, error);
    }
  }

  /**
   * الحصول على تصنيف من الـ cache
   */
  async getCachedCategory(id: string): Promise<StoreCategory | null> {
    try {
      const key = `${this.CACHE_PREFIX}${id}`;
      const cached = await this.redisService.get(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Failed to get cached category: ${id}`, error);
    }
    return null;
  }

  /**
   * حذف تصنيف من الـ cache
   */
  async deleteCachedCategory(id: string): Promise<void> {
    try {
      const key = `${this.CACHE_PREFIX}${id}`;
      await this.redisService.del(key);
    } catch (error) {
      this.logger.warn(`Failed to delete cached category: ${id}`, error);
    }
  }

  /**
   * حذف جميع التصنيفات من الـ cache
   */
  async clearAllCategoriesCache(): Promise<void> {
    try {
      // حذف cache للتصنيفات الرئيسية
      await this.redisService.del(`${this.CACHE_PREFIX}root`);
      await this.redisService.del(`${this.CACHE_PREFIX}all`);
    } catch (error) {
      this.logger.warn('Failed to clear categories cache', error);
    }
  }
}

