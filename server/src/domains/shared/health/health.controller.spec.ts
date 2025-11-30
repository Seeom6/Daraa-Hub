import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  MongooseHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.health';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let mongooseHealthIndicator: MongooseHealthIndicator;
  let memoryHealthIndicator: MemoryHealthIndicator;
  let redisHealthIndicator: RedisHealthIndicator;

  const mockHealthCheckService = {
    check: jest.fn(),
  };

  const mockMongooseHealthIndicator = {
    pingCheck: jest.fn(),
  };

  const mockMemoryHealthIndicator = {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  };

  const mockRedisHealthIndicator = {
    isHealthy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealthCheckService },
        {
          provide: MongooseHealthIndicator,
          useValue: mockMongooseHealthIndicator,
        },
        { provide: MemoryHealthIndicator, useValue: mockMemoryHealthIndicator },
        { provide: RedisHealthIndicator, useValue: mockRedisHealthIndicator },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    mongooseHealthIndicator = module.get<MongooseHealthIndicator>(
      MongooseHealthIndicator,
    );
    memoryHealthIndicator = module.get<MemoryHealthIndicator>(
      MemoryHealthIndicator,
    );
    redisHealthIndicator =
      module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should perform full health check', async () => {
      const healthResult = {
        status: 'ok',
        info: {
          database: { status: 'up' },
          redis: { status: 'up' },
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      };
      mockHealthCheckService.check.mockResolvedValue(healthResult);

      const result = await controller.check();

      expect(result).toEqual(healthResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should call all health indicators in check', async () => {
      // Mock check to execute the callback functions
      mockHealthCheckService.check.mockImplementation(async (indicators) => {
        for (const indicator of indicators) {
          await indicator();
        }
        return { status: 'ok' };
      });
      mockMongooseHealthIndicator.pingCheck.mockResolvedValue({
        database: { status: 'up' },
      });
      mockRedisHealthIndicator.isHealthy.mockResolvedValue({
        redis: { status: 'up' },
      });
      mockMemoryHealthIndicator.checkHeap.mockResolvedValue({
        memory_heap: { status: 'up' },
      });
      mockMemoryHealthIndicator.checkRSS.mockResolvedValue({
        memory_rss: { status: 'up' },
      });

      await controller.check();

      expect(mongooseHealthIndicator.pingCheck).toHaveBeenCalledWith(
        'database',
        { timeout: 3000 },
      );
      expect(redisHealthIndicator.isHealthy).toHaveBeenCalledWith('redis');
      expect(memoryHealthIndicator.checkHeap).toHaveBeenCalledWith(
        'memory_heap',
        300 * 1024 * 1024,
      );
      expect(memoryHealthIndicator.checkRSS).toHaveBeenCalledWith(
        'memory_rss',
        500 * 1024 * 1024,
      );
    });
  });

  describe('checkDatabase', () => {
    it('should perform database health check', async () => {
      const healthResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
      };
      mockHealthCheckService.check.mockResolvedValue(healthResult);

      const result = await controller.checkDatabase();

      expect(result).toEqual(healthResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should call database ping check', async () => {
      mockHealthCheckService.check.mockImplementation(async (indicators) => {
        for (const indicator of indicators) {
          await indicator();
        }
        return { status: 'ok' };
      });
      mockMongooseHealthIndicator.pingCheck.mockResolvedValue({
        database: { status: 'up' },
      });

      await controller.checkDatabase();

      expect(mongooseHealthIndicator.pingCheck).toHaveBeenCalledWith(
        'database',
        { timeout: 3000 },
      );
    });
  });

  describe('checkRedis', () => {
    it('should perform redis health check', async () => {
      const healthResult = {
        status: 'ok',
        info: { redis: { status: 'up' } },
      };
      mockHealthCheckService.check.mockResolvedValue(healthResult);

      const result = await controller.checkRedis();

      expect(result).toEqual(healthResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should call redis health indicator', async () => {
      mockHealthCheckService.check.mockImplementation(async (indicators) => {
        for (const indicator of indicators) {
          await indicator();
        }
        return { status: 'ok' };
      });
      mockRedisHealthIndicator.isHealthy.mockResolvedValue({
        redis: { status: 'up' },
      });

      await controller.checkRedis();

      expect(redisHealthIndicator.isHealthy).toHaveBeenCalledWith('redis');
    });
  });

  describe('checkMemory', () => {
    it('should perform memory health check', async () => {
      const healthResult = {
        status: 'ok',
        info: {
          memory_heap: { status: 'up' },
          memory_rss: { status: 'up' },
        },
      };
      mockHealthCheckService.check.mockResolvedValue(healthResult);

      const result = await controller.checkMemory();

      expect(result).toEqual(healthResult);
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should call memory health indicators', async () => {
      mockHealthCheckService.check.mockImplementation(async (indicators) => {
        for (const indicator of indicators) {
          await indicator();
        }
        return { status: 'ok' };
      });
      mockMemoryHealthIndicator.checkHeap.mockResolvedValue({
        memory_heap: { status: 'up' },
      });
      mockMemoryHealthIndicator.checkRSS.mockResolvedValue({
        memory_rss: { status: 'up' },
      });

      await controller.checkMemory();

      expect(memoryHealthIndicator.checkHeap).toHaveBeenCalledWith(
        'memory_heap',
        300 * 1024 * 1024,
      );
      expect(memoryHealthIndicator.checkRSS).toHaveBeenCalledWith(
        'memory_rss',
        500 * 1024 * 1024,
      );
    });
  });
});
