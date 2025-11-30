import { AUDIT_LOG_KEY } from '../interceptors/audit-log.interceptor';
import {
  AuditLog,
  AuditUserAction,
  AuditStoreAction,
  AuditCourierAction,
  AuditOrderAction,
  AuditSecurityAction,
} from './audit-log.decorator';

describe('AuditLog Decorators', () => {
  describe('AuditLog', () => {
    it('should set metadata with full options', () => {
      class TestController {
        @AuditLog({
          action: 'test_action',
          category: 'user',
          actionType: 'create',
          description: 'Test description',
        })
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(AUDIT_LOG_KEY, descriptor!.value);

      expect(metadata).toEqual({
        action: 'test_action',
        category: 'user',
        actionType: 'create',
        description: 'Test description',
      });
    });
  });

  describe('AuditUserAction', () => {
    it('should set user category metadata', () => {
      class TestController {
        @AuditUserAction('user_login', 'other', 'User logged in')
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(AUDIT_LOG_KEY, descriptor!.value);

      expect(metadata).toEqual({
        action: 'user_login',
        category: 'user',
        actionType: 'other',
        description: 'User logged in',
      });
    });

    it('should work without description', () => {
      class TestController {
        @AuditUserAction('user_update', 'update')
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(AUDIT_LOG_KEY, descriptor!.value);

      expect(metadata.category).toBe('user');
      expect(metadata.description).toBeUndefined();
    });
  });

  describe('AuditStoreAction', () => {
    it('should set store category metadata', () => {
      class TestController {
        @AuditStoreAction('store_create', 'create', 'Store created')
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(AUDIT_LOG_KEY, descriptor!.value);

      expect(metadata).toEqual({
        action: 'store_create',
        category: 'store',
        actionType: 'create',
        description: 'Store created',
      });
    });
  });

  describe('AuditCourierAction', () => {
    it('should set courier category metadata', () => {
      class TestController {
        @AuditCourierAction('courier_suspend', 'suspend', 'Courier suspended')
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(AUDIT_LOG_KEY, descriptor!.value);

      expect(metadata).toEqual({
        action: 'courier_suspend',
        category: 'courier',
        actionType: 'suspend',
        description: 'Courier suspended',
      });
    });
  });

  describe('AuditOrderAction', () => {
    it('should set order category metadata', () => {
      class TestController {
        @AuditOrderAction('order_approve', 'approve', 'Order approved')
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(AUDIT_LOG_KEY, descriptor!.value);

      expect(metadata).toEqual({
        action: 'order_approve',
        category: 'order',
        actionType: 'approve',
        description: 'Order approved',
      });
    });
  });

  describe('AuditSecurityAction', () => {
    it('should set security category metadata', () => {
      class TestController {
        @AuditSecurityAction('password_reset', 'update', 'Password was reset')
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestController.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(AUDIT_LOG_KEY, descriptor!.value);

      expect(metadata).toEqual({
        action: 'password_reset',
        category: 'security',
        actionType: 'update',
        description: 'Password was reset',
      });
    });
  });
});
