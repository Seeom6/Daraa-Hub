import {
  Controller,
  Get,
  Post,
  Put,
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
import { AdminGuard } from '../../admin/guards/admin.guard';
import { PermissionsGuard } from '../../admin/guards/permissions.guard';
import { RequirePermissions } from '../../admin/decorators/permissions.decorator';
import { SettingsService } from '../services/settings.service';
import { CreateSettingsDto } from '../dto/create-settings.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public endpoint - get settings by key (for frontend)
  @Get('public/:key')
  async getPublicSettings(@Param('key') key: string) {
    const settings = await this.settingsService.findByKey(key);
    
    // Only return certain settings publicly
    const publicKeys = ['general', 'features'];
    if (!publicKeys.includes(key)) {
      return {
        success: false,
        message: 'Settings not available publicly',
      };
    }

    return {
      success: true,
      data: settings,
    };
  }

  // Admin endpoints
  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'settings', action: 'view' })
  async getAllSettings(@Query('category') category?: string) {
    const settings = await this.settingsService.findAll(category);
    return {
      success: true,
      data: settings,
    };
  }

  @Get(':key')
  @UseGuards(JwtAuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'settings', action: 'view' })
  async getSettings(@Param('key') key: string) {
    const settings = await this.settingsService.findByKey(key);
    return {
      success: true,
      data: settings,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'settings', action: 'edit' })
  @HttpCode(HttpStatus.CREATED)
  async createSettings(
    @Body() createSettingsDto: CreateSettingsDto,
    @Req() req: any,
  ) {
    const settings = await this.settingsService.create(
      createSettingsDto,
      req.user.sub,
    );
    return {
      success: true,
      message: 'Settings created successfully',
      data: settings,
    };
  }

  @Put(':key')
  @UseGuards(JwtAuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'settings', action: 'edit' })
  @HttpCode(HttpStatus.OK)
  async updateSettings(
    @Param('key') key: string,
    @Body() updateSettingsDto: UpdateSettingsDto,
    @Req() req: any,
  ) {
    const settings = await this.settingsService.update(
      key,
      updateSettingsDto,
      req.user.sub,
    );
    return {
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    };
  }

  @Put(':key/value')
  @UseGuards(JwtAuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'settings', action: 'edit' })
  @HttpCode(HttpStatus.OK)
  async updateSettingsValue(
    @Param('key') key: string,
    @Body('value') value: Record<string, any>,
    @Req() req: any,
  ) {
    const settings = await this.settingsService.updateValue(
      key,
      value,
      req.user.sub,
    );
    return {
      success: true,
      message: 'Settings value updated successfully',
      data: settings,
    };
  }

  @Delete(':key')
  @UseGuards(JwtAuthGuard, AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'settings', action: 'edit' })
  @HttpCode(HttpStatus.OK)
  async deleteSettings(@Param('key') key: string) {
    await this.settingsService.delete(key);
    return {
      success: true,
      message: 'Settings deleted successfully',
    };
  }

  @Post('initialize-defaults')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async initializeDefaults() {
    await this.settingsService.initializeDefaults();
    return {
      success: true,
      message: 'Default settings initialized successfully',
    };
  }
}

