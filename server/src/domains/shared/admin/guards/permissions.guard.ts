import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminService } from '../services/admin.service';

export const PERMISSIONS_KEY = 'permissions';

export interface RequiredPermission {
  resource: string; // e.g., 'users', 'stores', 'couriers'
  action: string;   // e.g., 'view', 'approve', 'suspend'
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private adminService: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<RequiredPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No specific permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get admin profile with permissions
    const adminProfile = await this.adminService.findByAccountId(user.sub);

    if (!adminProfile) {
      throw new ForbiddenException('Admin profile not found');
    }

    // Super admin has all permissions
    if (adminProfile.role === 'super_admin') {
      return true;
    }

    // Check if admin has all required permissions
    for (const permission of requiredPermissions) {
      const hasPermission = this.checkPermission(
        adminProfile.permissions,
        permission.resource,
        permission.action,
      );

      if (!hasPermission) {
        throw new ForbiddenException(
          `Missing permission: ${permission.resource}.${permission.action}`,
        );
      }
    }

    return true;
  }

  private checkPermission(
    permissions: any,
    resource: string,
    action: string,
  ): boolean {
    if (!permissions[resource]) {
      return false;
    }

    return permissions[resource][action] === true;
  }
}

