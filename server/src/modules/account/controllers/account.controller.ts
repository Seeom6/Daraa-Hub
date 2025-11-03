import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AccountService } from '../services/account.service';
import { UpgradeRoleDto } from '../dto/upgrade-role.dto';
import { JwtAuthGuard } from '../../../common/guards';

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
}

