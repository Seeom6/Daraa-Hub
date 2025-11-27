import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

/**
 * Redis Health Indicator
 * Checks if Redis is healthy and responsive
 */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const client = this.redisService.getClient();
      
      // Try to ping Redis
      const pong = await client.ping();
      
      const isHealthy = pong === 'PONG';
      
      const result = this.getStatus(key, isHealthy, {
        message: isHealthy ? 'Redis is healthy' : 'Redis is not responding',
      });

      if (isHealthy) {
        return result;
      }

      throw new HealthCheckError('Redis health check failed', result);
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: error.message || 'Redis connection failed',
      });
      throw new HealthCheckError('Redis health check failed', result);
    }
  }
}

