import { ExecutionContext } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { CurrentUser } from './current-user.decorator';

describe('CurrentUser Decorator', () => {
  function getParamDecoratorFactory(decorator: Function) {
    class Test {
      public test(@decorator() value: any) {}
    }

    const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'test');
    return args[Object.keys(args)[0]].factory;
  }

  const createMockContext = (user: any): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  it('should extract user from request', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockUser = { userId: 'user-123', role: 'customer' };
    const ctx = createMockContext(mockUser);

    const result = factory(null, ctx);

    expect(result).toEqual(mockUser);
  });

  it('should return undefined when no user in request', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const ctx = createMockContext(undefined);

    const result = factory(null, ctx);

    expect(result).toBeUndefined();
  });

  it('should return null when user is null', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const ctx = createMockContext(null);

    const result = factory(null, ctx);

    expect(result).toBeNull();
  });

  it('should extract user with all properties', () => {
    const factory = getParamDecoratorFactory(CurrentUser);
    const mockUser = {
      userId: 'user-123',
      role: 'store_owner',
      profileId: 'profile-456',
      sub: 'account-789',
    };
    const ctx = createMockContext(mockUser);

    const result = factory(null, ctx);

    expect(result).toEqual(mockUser);
    expect(result.userId).toBe('user-123');
    expect(result.role).toBe('store_owner');
    expect(result.profileId).toBe('profile-456');
  });
});
