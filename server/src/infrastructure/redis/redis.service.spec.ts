import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

// Mock ioredis
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  ttl: jest.fn(),
  hset: jest.fn(),
  hget: jest.fn(),
  hgetall: jest.fn(),
  hdel: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
};

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => mockRedisClient);
});

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              host: 'localhost',
              port: 6379,
              password: '',
              db: 0,
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  describe('get', () => {
    it('should get value from redis', async () => {
      mockRedisClient.get.mockResolvedValue('test-value');

      const result = await service.get('test-key');

      expect(result).toBe('test-value');
      expect(mockRedisClient.get).toHaveBeenCalledWith('test-key');
    });

    it('should return null for non-existent key', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await service.get('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should set value without TTL', async () => {
      mockRedisClient.set.mockResolvedValue('OK');

      await service.set('test-key', 'test-value');

      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'test-key',
        'test-value',
      );
    });

    it('should set value with TTL', async () => {
      mockRedisClient.setex.mockResolvedValue('OK');

      await service.set('test-key', 'test-value', 3600);

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        'test-key',
        3600,
        'test-value',
      );
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      await service.del('test-key');

      expect(mockRedisClient.del).toHaveBeenCalledWith('test-key');
    });
  });

  describe('exists', () => {
    it('should return true if key exists', async () => {
      mockRedisClient.exists.mockResolvedValue(1);

      const result = await service.exists('test-key');

      expect(result).toBe(true);
    });

    it('should return false if key does not exist', async () => {
      mockRedisClient.exists.mockResolvedValue(0);

      const result = await service.exists('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('incr', () => {
    it('should increment key value', async () => {
      mockRedisClient.incr.mockResolvedValue(5);

      const result = await service.incr('counter');

      expect(result).toBe(5);
      expect(mockRedisClient.incr).toHaveBeenCalledWith('counter');
    });
  });

  describe('expire', () => {
    it('should set expiration on key', async () => {
      mockRedisClient.expire.mockResolvedValue(1);

      await service.expire('test-key', 3600);

      expect(mockRedisClient.expire).toHaveBeenCalledWith('test-key', 3600);
    });
  });

  describe('ttl', () => {
    it('should return TTL of key', async () => {
      mockRedisClient.ttl.mockResolvedValue(3600);

      const result = await service.ttl('test-key');

      expect(result).toBe(3600);
    });
  });

  describe('hash operations', () => {
    it('should set hash field', async () => {
      mockRedisClient.hset.mockResolvedValue(1);

      await service.hset('hash-key', 'field', 'value');

      expect(mockRedisClient.hset).toHaveBeenCalledWith(
        'hash-key',
        'field',
        'value',
      );
    });

    it('should get hash field', async () => {
      mockRedisClient.hget.mockResolvedValue('value');

      const result = await service.hget('hash-key', 'field');

      expect(result).toBe('value');
    });

    it('should get all hash fields', async () => {
      mockRedisClient.hgetall.mockResolvedValue({
        field1: 'value1',
        field2: 'value2',
      });

      const result = await service.hgetall('hash-key');

      expect(result).toEqual({ field1: 'value1', field2: 'value2' });
    });

    it('should delete hash field', async () => {
      mockRedisClient.hdel.mockResolvedValue(1);

      await service.hdel('hash-key', 'field');

      expect(mockRedisClient.hdel).toHaveBeenCalledWith('hash-key', 'field');
    });
  });

  describe('onModuleDestroy', () => {
    it('should disconnect redis client', () => {
      service.onModuleDestroy();

      expect(mockRedisClient.disconnect).toHaveBeenCalled();
    });
  });

  describe('getClient', () => {
    it('should return redis client', () => {
      const client = service.getClient();

      expect(client).toBeDefined();
    });
  });
});
