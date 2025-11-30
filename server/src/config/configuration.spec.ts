import configuration from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('default values', () => {
    it('should return default port 3001', () => {
      const config = configuration();
      expect(config.port).toBe(3001);
    });

    it('should return nodeEnv from environment or default', () => {
      // During tests, NODE_ENV is typically 'test'
      const config = configuration();
      expect(['development', 'test', 'production']).toContain(config.nodeEnv);
    });

    it('should return default appUrl', () => {
      const config = configuration();
      expect(config.appUrl).toBe('http://localhost:3001');
    });

    it('should return default clientUrl', () => {
      const config = configuration();
      expect(config.clientUrl).toBe('http://localhost:3000');
    });

    it('should return default database uri', () => {
      const config = configuration();
      expect(config.database.uri).toBe('mongodb://localhost:27017/daraa-auth');
    });

    it('should return default jwt settings', () => {
      const config = configuration();
      expect(config.jwt.secret).toBe('default-secret-key');
      expect(config.jwt.expiresIn).toBe('7d');
      expect(config.jwt.refreshSecret).toBe('default-refresh-secret');
      expect(config.jwt.refreshExpiresIn).toBe('30d');
    });

    it('should return default cookie secret', () => {
      const config = configuration();
      expect(config.cookie.secret).toBe('default-cookie-secret');
    });

    it('should return default otp settings', () => {
      const config = configuration();
      expect(config.otp.expiryMinutes).toBe(5);
      expect(config.otp.maxAttempts).toBe(3);
      expect(config.otp.length).toBe(6);
    });

    it('should return default redis settings', () => {
      const config = configuration();
      expect(config.redis.host).toBe('localhost');
      expect(config.redis.port).toBe(6379);
      expect(config.redis.password).toBeUndefined();
      expect(config.redis.db).toBe(0);
    });

    it('should return default email settings', () => {
      const config = configuration();
      expect(config.email.host).toBe('smtp.gmail.com');
      expect(config.email.port).toBe(587);
      expect(config.email.secure).toBe(false);
    });

    it('should return default aws settings', () => {
      const config = configuration();
      expect(config.aws.region).toBe('us-east-1');
      expect(config.aws.s3.bucket).toBe('daraa-uploads');
    });

    it('should return default upload settings', () => {
      const config = configuration();
      expect(config.upload.maxFileSize).toBe(5242880);
      expect(config.upload.allowedMimeTypes).toContain('image/jpeg');
    });

    it('should return default rate limit settings', () => {
      const config = configuration();
      expect(config.rateLimit.ttl).toBe(60);
      expect(config.rateLimit.limit).toBe(100);
    });
  });

  describe('environment variable overrides', () => {
    it('should use PORT from environment', () => {
      process.env.PORT = '4000';
      const config = configuration();
      expect(config.port).toBe(4000);
    });

    it('should use NODE_ENV from environment', () => {
      process.env.NODE_ENV = 'production';
      const config = configuration();
      expect(config.nodeEnv).toBe('production');
    });

    it('should use MONGODB_URI from environment', () => {
      process.env.MONGODB_URI = 'mongodb://custom:27017/test';
      const config = configuration();
      expect(config.database.uri).toBe('mongodb://custom:27017/test');
    });

    it('should use EMAIL_SECURE from environment', () => {
      process.env.EMAIL_SECURE = 'true';
      const config = configuration();
      expect(config.email.secure).toBe(true);
    });

    it('should use REDIS_PASSWORD from environment', () => {
      process.env.REDIS_PASSWORD = 'secret123';
      const config = configuration();
      expect(config.redis.password).toBe('secret123');
    });
  });
});
