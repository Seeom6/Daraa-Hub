import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { UpgradeRoleDto } from '../dto/upgrade-role.dto';
import { UpdateStoreProfileDto } from '../dto/update-store-profile.dto';
import { JwtAuthGuard } from '../../../../common/guards';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

/**
 * Account Controller
 * Handles account management and profile operations
 */
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /**
   * Get current user's profile
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.accountService.getAccountWithProfile(req.user.userId);
  }

  /**
   * Upgrade account role (customer -> store_owner or courier)
   */
  @Post('upgrade-role')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async upgradeRole(@Request() req, @Body() dto: UpgradeRoleDto) {
    const account = await this.accountService.upgradeRole(req.user.userId, dto.role);

    return {
      message: 'Account role upgraded successfully',
      role: account.role,
      verificationStatus: 'pending',
    };
  }

  /**
   * Update store owner profile
   * PUT /account/store-profile
   * Requires: Store Owner
   */
  @Put('store-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async updateStoreProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateStoreProfileDto,
  ) {
    const profile = await this.accountService.updateStoreProfile(
      user.sub,
      updateDto,
    );

    return {
      success: true,
      message: 'تم تحديث معلومات المتجر بنجاح',
      data: profile,
    };
  }

  /**
   * Get store owner profile
   * GET /account/store-profile
   * Requires: Store Owner
   */
  @Get('store-profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner')
  async getStoreProfile(@CurrentUser() user: any) {
    const profile = await this.accountService.getStoreProfile(user.sub);

    return {
      success: true,
      data: profile,
    };
  }
}

