import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RequireUserPermission } from '../decorators/permissions.decorator';
import { UserManagementService } from '../services/user-management.service';
import { AdminService } from '../services/admin.service';
import { SuspendUserDto, UnsuspendUserDto } from '../dto/suspend-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly adminService: AdminService,
  ) {}

  // ==================== Admin Profile ====================

  @Get('me')
  async getMyProfile(@Req() req: any) {
    const adminProfile = await this.adminService.findByAccountId(req.user.sub);
    return {
      success: true,
      data: adminProfile,
    };
  }

  @Get('activity-log')
  async getMyActivityLog(@Req() req: any, @Query('limit') limit?: number) {
    const activityLog = await this.adminService.getActivityLog(
      req.user.sub,
      limit ? parseInt(limit as any) : 50,
    );
    return {
      success: true,
      data: activityLog,
    };
  }

  // ==================== User Management ====================

  @Get('users')
  @UseGuards(PermissionsGuard)
  @RequireUserPermission('view')
  async getAllUsers(
    @Query('role') role?: string,
    @Query('isActive') isActive?: string,
    @Query('isVerified') isVerified?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      role,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isVerified: isVerified === 'true' ? true : isVerified === 'false' ? false : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await this.userManagementService.findAllUsers(filters);
    return {
      success: true,
      data: result,
    };
  }

  @Get('users/search')
  @UseGuards(PermissionsGuard)
  @RequireUserPermission('view')
  async searchUsers(@Query('q') query: string) {
    const users = await this.userManagementService.searchUsers(query);
    return {
      success: true,
      data: users,
    };
  }

  @Get('users/:id')
  @UseGuards(PermissionsGuard)
  @RequireUserPermission('view')
  async getUserById(@Param('id') id: string) {
    const user = await this.userManagementService.findUserById(id);
    return {
      success: true,
      data: user,
    };
  }

  @Get('users/:id/activity')
  @UseGuards(PermissionsGuard)
  @RequireUserPermission('view')
  async getUserActivity(@Param('id') id: string) {
    const activity = await this.userManagementService.getUserActivity(id);
    return {
      success: true,
      data: activity,
    };
  }

  @Patch('users/:id/suspend')
  @UseGuards(PermissionsGuard)
  @RequireUserPermission('suspend')
  @HttpCode(HttpStatus.OK)
  async suspendUser(
    @Param('id') id: string,
    @Body() suspendDto: SuspendUserDto,
    @Req() req: any,
  ) {
    const user = await this.userManagementService.suspendUser(
      id,
      suspendDto,
      req.user.sub,
    );

    // Log admin activity
    await this.adminService.logActivity(
      req.user.sub,
      'suspend_user',
      { userId: id, reason: suspendDto.reason, duration: suspendDto.durationDays },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      success: true,
      message: 'User suspended successfully',
      data: user,
    };
  }

  @Patch('users/:id/unsuspend')
  @UseGuards(PermissionsGuard)
  @RequireUserPermission('suspend')
  @HttpCode(HttpStatus.OK)
  async unsuspendUser(
    @Param('id') id: string,
    @Body() unsuspendDto: UnsuspendUserDto,
    @Req() req: any,
  ) {
    const user = await this.userManagementService.unsuspendUser(
      id,
      unsuspendDto,
      req.user.sub,
    );

    // Log admin activity
    await this.adminService.logActivity(
      req.user.sub,
      'unsuspend_user',
      { userId: id, reason: unsuspendDto.reason },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      success: true,
      message: 'User unsuspended successfully',
      data: user,
    };
  }

  @Patch('users/:id/ban')
  @UseGuards(PermissionsGuard)
  @RequireUserPermission('suspend')
  @HttpCode(HttpStatus.OK)
  async banUser(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const user = await this.userManagementService.banUser(
      id,
      reason,
      req.user.sub,
    );

    // Log admin activity
    await this.adminService.logActivity(
      req.user.sub,
      'ban_user',
      { userId: id, reason },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      success: true,
      message: 'User banned permanently',
      data: user,
    };
  }

  // ==================== Dashboard Stats ====================

  @Get('dashboard/stats')
  async getDashboardStats() {
    // TODO: Implement dashboard statistics
    return {
      success: true,
      data: {
        totalUsers: 0,
        totalStores: 0,
        totalCouriers: 0,
        totalOrders: 0,
        pendingVerifications: 0,
        activeDisputes: 0,
      },
    };
  }
}

