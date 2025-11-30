import { SetMetadata } from '@nestjs/common';

/**
 * Custom throttle limits for specific endpoints
 * معدلات مخصصة للـ endpoints الحساسة
 */

export const THROTTLE_LIMIT_KEY = 'throttle_limit';
export const THROTTLE_TTL_KEY = 'throttle_ttl';

/**
 * Strict rate limiting for sensitive endpoints (e.g., login, OTP)
 * 5 requests per minute
 */
export const StrictThrottle = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(THROTTLE_LIMIT_KEY, 5)(target, propertyKey, descriptor);
    SetMetadata(THROTTLE_TTL_KEY, 60)(target, propertyKey, descriptor);
  };
};

/**
 * Moderate rate limiting for normal operations
 * 30 requests per minute
 */
export const ModerateThrottle = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(THROTTLE_LIMIT_KEY, 30)(target, propertyKey, descriptor);
    SetMetadata(THROTTLE_TTL_KEY, 60)(target, propertyKey, descriptor);
  };
};

/**
 * Relaxed rate limiting for read operations
 * 100 requests per minute
 */
export const RelaxedThrottle = () => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(THROTTLE_LIMIT_KEY, 100)(target, propertyKey, descriptor);
    SetMetadata(THROTTLE_TTL_KEY, 60)(target, propertyKey, descriptor);
  };
};
