import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  let redisService: jest.Mocked<RedisService>;

  const mockRedisClient = {
    ping: jest.fn(),
  };

  const mockRedisService = {
    getClient: jest.fn().mockReturnValue(mockRedisClient),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
    redisService = module.get(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isHealthy', () => {
    it('should return healthy status when Redis responds with PONG', async () => {
      mockRedisClient.ping.mockResolvedValue('PONG');

      const result = await indicator.isHealthy('redis');

      expect(result).toEqual({
        redis: {
          status: 'up',
          message: 'Redis is healthy',
        },
      });
    });

    it('should throw HealthCheckError when Redis does not respond with PONG', async () => {
      mockRedisClient.ping.mockResolvedValue('NOT_PONG');

      await expect(indicator.isHealthy('redis')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should throw HealthCheckError when Redis connection fails', async () => {
      mockRedisClient.ping.mockRejectedValue(new Error('Connection refused'));

      await expect(indicator.isHealthy('redis')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should include error message in health check error', async () => {
      mockRedisClient.ping.mockRejectedValue(new Error('Connection timeout'));

      try {
        await indicator.isHealthy('redis');
        fail('Expected HealthCheckError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        expect(error.causes).toEqual({
          redis: {
            status: 'down',
            message: 'Connection timeout',
          },
        });
      }
    });

    it('should handle error without message', async () => {
      mockRedisClient.ping.mockRejectedValue({});

      try {
        await indicator.isHealthy('redis');
        fail('Expected HealthCheckError to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HealthCheckError);
        expect(error.causes.redis.message).toBe('Redis connection failed');
      }
    });
  });
});
