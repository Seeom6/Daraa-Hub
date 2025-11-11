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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdminGuard } from '../../admin/guards/admin.guard';
import { PermissionsGuard } from '../../admin/guards/permissions.guard';
import { RequirePermissions } from '../../admin/decorators/permissions.decorator';
import { NotificationsService } from '../services/notifications.service';
import { NotificationPreferenceService } from '../services/notification-preference.service';
import { DeviceTokenService } from '../services/device-token.service';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { SendNotificationDto, SendBulkNotificationDto } from '../dto/send-notification.dto';
import { UpdateNotificationPreferenceDto } from '../dto/update-notification-preference.dto';
import { RegisterDeviceTokenDto } from '../dto/register-device-token.dto';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly notificationPreferenceService: NotificationPreferenceService,
    private readonly deviceTokenService: DeviceTokenService,
  ) {}

  // User endpoints
  @Get('my')
  @HttpCode(HttpStatus.OK)
  async getMyNotifications(
    @Req() req: any,
    @Query('type') type?: string,
    @Query('isRead') isRead?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const filters = {
      recipientId: req.user.sub,
      type,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 20,
    };

    const result = await this.notificationsService.findAll(filters);
    return {
      success: true,
      data: result,
    };
  }

  @Get('my/unread-count')
  @HttpCode(HttpStatus.OK)
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return {
      success: true,
      data: { count },
    };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const notification = await this.notificationsService.markAsRead(id);
    return {
      success: true,
      message: 'Notification marked as read',
      data: notification,
    };
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: any) {
    const count = await this.notificationsService.markAllAsRead(req.user.sub);
    return {
      success: true,
      message: `${count} notifications marked as read`,
      data: { count },
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Param('id') id: string) {
    await this.notificationsService.delete(id);
    return {
      success: true,
      message: 'Notification deleted successfully',
    };
  }

  @Delete('my/all')
  @HttpCode(HttpStatus.OK)
  async deleteAllNotifications(@Req() req: any) {
    const count = await this.notificationsService.deleteAll(req.user.sub);
    return {
      success: true,
      message: `${count} notifications deleted`,
      data: { count },
    };
  }

  // Admin endpoints
  @Post()
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'notifications', action: 'send_bulk' })
  @HttpCode(HttpStatus.CREATED)
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(createNotificationDto);
    return {
      success: true,
      message: 'Notification created successfully',
      data: notification,
    };
  }

  @Post('send')
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'notifications', action: 'send_bulk' })
  @HttpCode(HttpStatus.OK)
  async sendNotification(@Body() sendNotificationDto: SendNotificationDto) {
    const notification = await this.notificationsService.sendFromTemplate(sendNotificationDto);
    return {
      success: true,
      message: 'Notification sent successfully',
      data: notification,
    };
  }

  @Post('send-bulk')
  @UseGuards(AdminGuard, PermissionsGuard)
  @RequirePermissions({ resource: 'notifications', action: 'send_bulk' })
  @HttpCode(HttpStatus.OK)
  async sendBulkNotification(@Body() sendBulkDto: SendBulkNotificationDto) {
    const notifications = await this.notificationsService.sendBulk(sendBulkDto);
    return {
      success: true,
      message: `${notifications.length} notifications sent successfully`,
      data: { count: notifications.length },
    };
  }

  @Get('templates')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async getAllTemplates() {
    const templates = await this.notificationsService.getAllTemplates();
    return {
      success: true,
      data: templates,
    };
  }

  @Get('templates/:code')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  async getTemplateByCode(@Param('code') code: string) {
    const template = await this.notificationsService.findTemplateByCode(code);
    return {
      success: true,
      data: template,
    };
  }

  // Notification Preferences endpoints
  @Get('preferences')
  @HttpCode(HttpStatus.OK)
  async getPreferences(@Req() req: any) {
    const preferences = await this.notificationPreferenceService.getPreferences(req.user.sub);
    return {
      success: true,
      data: preferences,
    };
  }

  @Patch('preferences')
  @HttpCode(HttpStatus.OK)
  async updatePreferences(
    @Req() req: any,
    @Body() updateDto: UpdateNotificationPreferenceDto,
  ) {
    const preferences = await this.notificationPreferenceService.updatePreferences(
      req.user.sub,
      updateDto,
    );
    return {
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences,
    };
  }

  // Device Token endpoints
  @Post('devices')
  @HttpCode(HttpStatus.CREATED)
  async registerDevice(
    @Req() req: any,
    @Body() registerDto: RegisterDeviceTokenDto,
  ) {
    const deviceToken = await this.deviceTokenService.registerToken(
      req.user.sub,
      registerDto,
    );
    return {
      success: true,
      message: 'Device registered successfully',
      data: deviceToken,
    };
  }

  @Get('devices')
  @HttpCode(HttpStatus.OK)
  async getMyDevices(@Req() req: any) {
    const devices = await this.deviceTokenService.getUserTokens(req.user.sub);
    return {
      success: true,
      data: devices,
    };
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.OK)
  async deleteDevice(@Req() req: any, @Param('id') id: string) {
    await this.deviceTokenService.deleteToken(id, req.user.sub);
    return {
      success: true,
      message: 'Device removed successfully',
    };
  }
}

