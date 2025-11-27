import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY, RequiredPermission } from '../guards/permissions.guard';

export const RequirePermissions = (...permissions: RequiredPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// Helper functions for common permission patterns
export const RequireUserPermission = (action: string) =>
  RequirePermissions({ resource: 'users', action });

export const RequireStorePermission = (action: string) =>
  RequirePermissions({ resource: 'stores', action });

export const RequireCourierPermission = (action: string) =>
  RequirePermissions({ resource: 'couriers', action });

export const RequireProductPermission = (action: string) =>
  RequirePermissions({ resource: 'products', action });

export const RequireOrderPermission = (action: string) =>
  RequirePermissions({ resource: 'orders', action });

