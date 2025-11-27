import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.health';

/**
 * Health Check Controller
 * Provides health check endpoints for monitoring
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  /**
   * Basic health check
   * GET /health
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Database health
      () => this.db.pingCheck('database', { timeout: 3000 }),

      // Redis health
      () => this.redis.isHealthy('redis'),

      // Memory health (heap should not exceed 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Memory health (RSS should not exceed 500MB)
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),

      // Disk health removed - not compatible with Windows
      // Use platform-specific path for disk checks in production
    ]);
  }

  /**
   * Database-only health check
   * GET /health/db
   */
  @Get('db')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 3000 }),
    ]);
  }

  /**
   * Redis-only health check
   * GET /health/redis
   */
  @Get('redis')
  @HealthCheck()
  checkRedis() {
    return this.health.check([
      () => this.redis.isHealthy('redis'),
    ]);
  }

  /**
   * Memory-only health check
   * GET /health/memory
   */
  @Get('memory')
  @HealthCheck()
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),
    ]);
  }
}

