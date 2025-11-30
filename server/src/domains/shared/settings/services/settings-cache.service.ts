import { Injectable, Logger } from '@nestjs/common';
import { SystemSettingsDocument } from '../../../../database/schemas/system-settings.schema';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

/**
 * Service for settings caching operations
 */
@Injectable()
export class SettingsCacheService {
  private readonly logger = new Logger(SettingsCacheService.name);
  private readonly CACHE_PREFIX = 'settings:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(private redisService: RedisService) {}

  async cacheSettings(
    key: string,
    settings: SystemSettingsDocument,
  ): Promise<void> {
    try {
      await this.redisService.set(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(settings),
        this.CACHE_TTL,
      );
    } catch (error) {
      this.logger.warn(`Failed to cache settings: ${key}`, error);
    }
  }

  async getCachedSettings(key: string): Promise<SystemSettingsDocument | null> {
    try {
      const cached = await this.redisService.get(`${this.CACHE_PREFIX}${key}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Failed to get cached settings: ${key}`, error);
    }
    return null;
  }

  async deleteCachedSettings(key: string): Promise<void> {
    try {
      await this.redisService.del(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      this.logger.warn(`Failed to delete cached settings: ${key}`, error);
    }
  }
}
