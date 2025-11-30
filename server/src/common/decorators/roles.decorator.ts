import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to set required roles for a route
 * Usage: @Roles('admin', 'store_owner')
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
