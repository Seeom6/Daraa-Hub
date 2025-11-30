import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

// Cache key prefixes for organization
export const CACHE_KEYS = {
  PRODUCT: 'product:',
  STORE: 'store:',
  CATEGORY: 'category:',
  USER: 'user:',
  CART: 'cart:',
  ORDER: 'order:',
  SETTINGS: 'settings:',
  RATE_LIMIT: 'rate_limit:',
  SESSION: 'session:',
  OTP: 'otp:',
} as const;

// Default TTL values in seconds
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
  PRODUCT: 1800, // 30 minutes
  STORE: 3600, // 1 hour
  CATEGORY: 7200, // 2 hours
  SETTINGS: 86400, // 24 hours
  SESSION: 604800, // 7 days
} as const;

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    const redisConfig = this.configService.get('redis');

    this.client = new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      password: redisConfig.password,
      db: redisConfig.db,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
      retryStrategy: (times) => {
        if (times > 10) {
          this.logger.error('Redis max retries reached, giving up');
          return null;
        }
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
      reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });

    this.client.on('ready', () => {
      this.logger.log('Redis ready to accept commands');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error.message);
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    await this.client.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hdel(key, field);
  }

  // ============================================
  // Advanced Caching Methods
  // ============================================

  /**
   * Get or set cache with automatic JSON serialization
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl: number = CACHE_TTL.MEDIUM,
  ): Promise<T> {
    const cached = await this.get(key);
    if (cached) {
      try {
        return JSON.parse(cached) as T;
      } catch {
        // Invalid JSON, fetch fresh data
      }
    }

    const data = await factory();
    await this.set(key, JSON.stringify(data), ttl);
    return data;
  }

  /**
   * Get JSON data from cache
   */
  async getJson<T>(key: string): Promise<T | null> {
    const data = await this.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  /**
   * Set JSON data to cache
   */
  async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }

  /**
   * Delete multiple keys by pattern
   */
  async deleteByPattern(pattern: string): Promise<number> {
    const keys = await this.client.keys(pattern);
    if (keys.length === 0) return 0;
    return this.client.del(...keys);
  }

  /**
   * Invalidate cache for a specific entity
   */
  async invalidateEntity(prefix: string, id: string): Promise<void> {
    await this.deleteByPattern(`${prefix}${id}*`);
  }

  /**
   * Multi-get for batch operations
   */
  async mget(keys: string[]): Promise<(string | null)[]> {
    if (keys.length === 0) return [];
    return this.client.mget(...keys);
  }

  /**
   * Multi-set for batch operations
   */
  async mset(keyValues: Record<string, string>, ttl?: number): Promise<void> {
    const pipeline = this.client.pipeline();
    for (const [key, value] of Object.entries(keyValues)) {
      if (ttl) {
        pipeline.setex(key, ttl, value);
      } else {
        pipeline.set(key, value);
      }
    }
    await pipeline.exec();
  }

  /**
   * Add to sorted set (for leaderboards, rankings)
   */
  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.client.zadd(key, score, member);
  }

  /**
   * Get top N from sorted set
   */
  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrevrange(key, start, stop);
  }

  /**
   * Get rank in sorted set
   */
  async zrank(key: string, member: string): Promise<number | null> {
    return this.client.zrank(key, member);
  }

  /**
   * Add to set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  /**
   * Get all members of set
   */
  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  /**
   * Check if member exists in set
   */
  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  /**
   * Push to list (for queues)
   */
  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.client.lpush(key, ...values);
  }

  /**
   * Pop from list
   */
  async rpop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  /**
   * Get list length
   */
  async llen(key: string): Promise<number> {
    return this.client.llen(key);
  }

  /**
   * Health check
   */
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch {
      return false;
    }
  }

  /**
   * Get Redis info
   */
  async info(): Promise<string> {
    return this.client.info();
  }

  /**
   * Flush current database (use with caution!)
   */
  async flushDb(): Promise<void> {
    if (this.configService.get('nodeEnv') === 'production') {
      throw new Error('Cannot flush database in production');
    }
    await this.client.flushdb();
  }

  onModuleDestroy() {
    this.client.disconnect();
    this.logger.log('Redis disconnected');
  }
}
