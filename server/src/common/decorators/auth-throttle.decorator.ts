import { Throttle } from '@nestjs/throttler';

/**
 * Auth Throttle Decorator
 * Applies rate limiting for authentication endpoints
 * - Test environment: 1000 requests per minute (very relaxed for E2E tests)
 * - Production environment: 5 requests per minute (or from AUTH_RATE_LIMIT env var)
 */
export const AuthThrottle = () => {
  const isTest = process.env.NODE_ENV === 'test';
  const limit = isTest
    ? 1000
    : parseInt(process.env.AUTH_RATE_LIMIT || '5', 10);
  const ttl = 60000; // 60 seconds in milliseconds

  return Throttle({ default: { limit, ttl } });
};
