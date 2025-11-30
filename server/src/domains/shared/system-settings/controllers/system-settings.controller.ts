import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { SystemSettingsService } from '../services/system-settings.service';
import { UpdateSubscriptionSettingsDto } from '../dto';

@Controller('system-settings')
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  /**
   * Get subscription settings (Admin only)
   * GET /system-settings/subscription
   */
  @Get('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSubscriptionSettings() {
    const settings = await this.systemSettingsService.getSubscriptionSettings();
    return {
      success: true,
      data: settings,
    };
  }

  /**
   * Update subscription settings (Admin only)
   * PUT /system-settings/subscription
   */
  @Put('subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async updateSubscriptionSettings(
    @Body() updateDto: UpdateSubscriptionSettingsDto,
    @CurrentUser() user: any,
  ) {
    const settings =
      await this.systemSettingsService.updateSubscriptionSettings(
        updateDto,
        user.userId,
      );
    return {
      success: true,
      message: 'Subscription settings updated successfully',
      data: settings,
    };
  }
}
