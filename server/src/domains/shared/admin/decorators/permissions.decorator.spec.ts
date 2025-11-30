import { PERMISSIONS_KEY } from '../guards/permissions.guard';
import {
  RequirePermissions,
  RequireUserPermission,
  RequireStorePermission,
  RequireCourierPermission,
  RequireProductPermission,
  RequireOrderPermission,
} from './permissions.decorator';

describe('Permissions Decorators', () => {
  describe('RequirePermissions', () => {
    it('should set permissions metadata', () => {
      const permissions = [{ resource: 'users', action: 'read' }];
      const decorator = RequirePermissions(...permissions);

      class TestClass {
        @decorator
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, descriptor.value);

      expect(metadata).toEqual(permissions);
    });

    it('should set multiple permissions', () => {
      const permissions = [
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'write' },
      ];
      const decorator = RequirePermissions(...permissions);

      class TestClass {
        @decorator
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, descriptor.value);

      expect(metadata).toEqual(permissions);
    });
  });

  describe('RequireUserPermission', () => {
    it('should set user permission with action', () => {
      const decorator = RequireUserPermission('read');

      class TestClass {
        @decorator
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, descriptor.value);

      expect(metadata).toEqual([{ resource: 'users', action: 'read' }]);
    });
  });

  describe('RequireStorePermission', () => {
    it('should set store permission with action', () => {
      const decorator = RequireStorePermission('manage');

      class TestClass {
        @decorator
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, descriptor.value);

      expect(metadata).toEqual([{ resource: 'stores', action: 'manage' }]);
    });
  });

  describe('RequireCourierPermission', () => {
    it('should set courier permission with action', () => {
      const decorator = RequireCourierPermission('approve');

      class TestClass {
        @decorator
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, descriptor.value);

      expect(metadata).toEqual([{ resource: 'couriers', action: 'approve' }]);
    });
  });

  describe('RequireProductPermission', () => {
    it('should set product permission with action', () => {
      const decorator = RequireProductPermission('delete');

      class TestClass {
        @decorator
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, descriptor.value);

      expect(metadata).toEqual([{ resource: 'products', action: 'delete' }]);
    });
  });

  describe('RequireOrderPermission', () => {
    it('should set order permission with action', () => {
      const decorator = RequireOrderPermission('cancel');

      class TestClass {
        @decorator
        testMethod() {}
      }

      const descriptor = Object.getOwnPropertyDescriptor(
        TestClass.prototype,
        'testMethod',
      );
      const metadata = Reflect.getMetadata(PERMISSIONS_KEY, descriptor.value);

      expect(metadata).toEqual([{ resource: 'orders', action: 'cancel' }]);
    });
  });
});
