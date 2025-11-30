import 'reflect-metadata';
import {
  StrictThrottle,
  ModerateThrottle,
  RelaxedThrottle,
  THROTTLE_LIMIT_KEY,
  THROTTLE_TTL_KEY,
} from './throttle.decorator';

describe('Throttle Decorators', () => {
  describe('StrictThrottle', () => {
    it('should set throttle limit to 5 and TTL to 60', () => {
      class TestController {
        @StrictThrottle()
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const limitMetadata = Reflect.getMetadata(
        THROTTLE_LIMIT_KEY,
        descriptor.value,
      );
      const ttlMetadata = Reflect.getMetadata(
        THROTTLE_TTL_KEY,
        descriptor.value,
      );

      expect(limitMetadata).toBe(5);
      expect(ttlMetadata).toBe(60);
    });
  });

  describe('ModerateThrottle', () => {
    it('should set throttle limit to 30 and TTL to 60', () => {
      class TestController {
        @ModerateThrottle()
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const limitMetadata = Reflect.getMetadata(
        THROTTLE_LIMIT_KEY,
        descriptor.value,
      );
      const ttlMetadata = Reflect.getMetadata(
        THROTTLE_TTL_KEY,
        descriptor.value,
      );

      expect(limitMetadata).toBe(30);
      expect(ttlMetadata).toBe(60);
    });
  });

  describe('RelaxedThrottle', () => {
    it('should set throttle limit to 100 and TTL to 60', () => {
      class TestController {
        @RelaxedThrottle()
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const limitMetadata = Reflect.getMetadata(
        THROTTLE_LIMIT_KEY,
        descriptor.value,
      );
      const ttlMetadata = Reflect.getMetadata(
        THROTTLE_TTL_KEY,
        descriptor.value,
      );

      expect(limitMetadata).toBe(100);
      expect(ttlMetadata).toBe(60);
    });
  });

  describe('Multiple decorators on different methods', () => {
    it('should apply different throttle settings to different methods', () => {
      class TestController {
        @StrictThrottle()
        login() {}

        @ModerateThrottle()
        updateProfile() {}

        @RelaxedThrottle()
        getProducts() {}
      }

      const loginDescriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'login',
      );
      const updateDescriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'updateProfile',
      );
      const getDescriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'getProducts',
      );

      // Check login method (strict)
      expect(
        Reflect.getMetadata(THROTTLE_LIMIT_KEY, loginDescriptor.value),
      ).toBe(5);

      // Check updateProfile method (moderate)
      expect(
        Reflect.getMetadata(THROTTLE_LIMIT_KEY, updateDescriptor.value),
      ).toBe(30);

      // Check getProducts method (relaxed)
      expect(Reflect.getMetadata(THROTTLE_LIMIT_KEY, getDescriptor.value)).toBe(
        100,
      );
    });
  });

  describe('Decorator factory', () => {
    it('should return a function', () => {
      expect(typeof StrictThrottle()).toBe('function');
      expect(typeof ModerateThrottle()).toBe('function');
      expect(typeof RelaxedThrottle()).toBe('function');
    });
  });
});
