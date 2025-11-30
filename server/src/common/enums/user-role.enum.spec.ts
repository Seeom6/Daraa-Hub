import { UserRole } from './user-role.enum';

describe('UserRole Enum', () => {
  it('should have CUSTOMER value', () => {
    expect(UserRole.CUSTOMER).toBe('customer');
  });

  it('should have STORE_OWNER value', () => {
    expect(UserRole.STORE_OWNER).toBe('store_owner');
  });

  it('should have COURIER value', () => {
    expect(UserRole.COURIER).toBe('courier');
  });

  it('should have ADMIN value', () => {
    expect(UserRole.ADMIN).toBe('admin');
  });

  it('should have exactly 4 values', () => {
    const values = Object.values(UserRole);
    expect(values).toHaveLength(4);
  });

  it('should be usable for role checking', () => {
    const isAdmin = (role: UserRole): boolean => role === UserRole.ADMIN;
    const isStoreOwner = (role: UserRole): boolean =>
      role === UserRole.STORE_OWNER;
    const isCourier = (role: UserRole): boolean => role === UserRole.COURIER;
    const isCustomer = (role: UserRole): boolean => role === UserRole.CUSTOMER;

    expect(isAdmin(UserRole.ADMIN)).toBe(true);
    expect(isAdmin(UserRole.CUSTOMER)).toBe(false);
    expect(isStoreOwner(UserRole.STORE_OWNER)).toBe(true);
    expect(isCourier(UserRole.COURIER)).toBe(true);
    expect(isCustomer(UserRole.CUSTOMER)).toBe(true);
  });

  it('should be usable in arrays for role hierarchy', () => {
    const adminRoles = [UserRole.ADMIN];
    const storeRoles = [UserRole.ADMIN, UserRole.STORE_OWNER];
    const allRoles = [
      UserRole.ADMIN,
      UserRole.STORE_OWNER,
      UserRole.COURIER,
      UserRole.CUSTOMER,
    ];

    expect(adminRoles).toContain(UserRole.ADMIN);
    expect(storeRoles).toContain(UserRole.STORE_OWNER);
    expect(allRoles).toHaveLength(4);
  });
});
