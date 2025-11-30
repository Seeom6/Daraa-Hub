import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import {
  HealthCheckService,
  HealthCheck,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.health';

/**
 * Health Check Controller
 * Provides health check endpoints for monitoring and metrics
 */
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();
  private requestCount = 0;
  private errorCount = 0;

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
    return this.health.check([() => this.redis.isHealthy('redis')]);
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

  /**
   * Prometheus Metrics Endpoint
   * GET /health/metrics
   */
  @Get('metrics')
  getMetrics(@Res() res: Response) {
    const memoryUsage = process.memoryUsage();
    const uptime = (Date.now() - this.startTime) / 1000;

    const metrics = `
# HELP nodejs_heap_size_total_bytes Total heap size in bytes
# TYPE nodejs_heap_size_total_bytes gauge
nodejs_heap_size_total_bytes ${memoryUsage.heapTotal}

# HELP nodejs_heap_size_used_bytes Used heap size in bytes
# TYPE nodejs_heap_size_used_bytes gauge
nodejs_heap_size_used_bytes ${memoryUsage.heapUsed}

# HELP nodejs_external_memory_bytes External memory in bytes
# TYPE nodejs_external_memory_bytes gauge
nodejs_external_memory_bytes ${memoryUsage.external}

# HELP nodejs_rss_bytes Resident Set Size in bytes
# TYPE nodejs_rss_bytes gauge
nodejs_rss_bytes ${memoryUsage.rss}

# HELP process_uptime_seconds Process uptime in seconds
# TYPE process_uptime_seconds gauge
process_uptime_seconds ${uptime}

# HELP process_start_time_seconds Start time of the process since unix epoch in seconds
# TYPE process_start_time_seconds gauge
process_start_time_seconds ${this.startTime / 1000}

# HELP nodejs_version_info Node.js version info
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1

# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total ${this.requestCount}

# HELP http_errors_total Total number of HTTP errors
# TYPE http_errors_total counter
http_errors_total ${this.errorCount}
`.trim();

    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
  }

  /**
   * Liveness probe for Kubernetes
   * GET /health/live
   */
  @Get('live')
  liveness() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Readiness probe for Kubernetes
   * GET /health/ready
   */
  @Get('ready')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 1000 }),
      () => this.redis.isHealthy('redis'),
    ]);
  }

  /**
   * Increment request counter (call from middleware)
   */
  incrementRequestCount() {
    this.requestCount++;
  }

  /**
   * Increment error counter (call from error handler)
   */
  incrementErrorCount() {
    this.errorCount++;
  }
}
