import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CourierService } from '../services/courier.service';
import { JwtAuthGuard } from '../../../../common/guards';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import {
  UpdateCourierProfileDto,
  UpdateCourierStatusDto,
  UpdateLocationDto,
  AcceptOrderDto,
  RejectOrderDto,
  UpdateDeliveryStatusDto,
} from '../dto';

/**
 * Courier Controller
 * Handles courier profile, delivery, and earnings management
 */
@Controller('courier')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CourierController {
  constructor(private readonly courierService: CourierService) {}

  /**
   * Get courier profile
   * GET /courier/profile
   */
  @Get('profile')
  @Roles('courier')
  async getProfile(@CurrentUser() user: any) {
    const profile = await this.courierService.getProfileByAccountId(user.sub);
    return {
      success: true,
      data: profile,
    };
  }

  /**
   * Update courier profile
   * PUT /courier/profile
   */
  @Put('profile')
  @Roles('courier')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateCourierProfileDto,
  ) {
    const profile = await this.courierService.updateProfile(
      user.sub,
      updateDto,
    );
    return {
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    };
  }

  /**
   * Update courier status (online/offline/busy/on_break)
   * PUT /courier/status
   */
  @Put('status')
  @Roles('courier')
  async updateStatus(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateCourierStatusDto,
  ) {
    const profile = await this.courierService.updateStatus(user.sub, updateDto);
    return {
      success: true,
      message: 'Status updated successfully',
      data: { status: profile.status },
    };
  }

  /**
   * Update courier location
   * PUT /courier/location
   */
  @Put('location')
  @Roles('courier')
  async updateLocation(
    @CurrentUser() user: any,
    @Body() updateDto: UpdateLocationDto,
  ) {
    const profile = await this.courierService.updateLocation(
      user.sub,
      updateDto,
    );
    return {
      success: true,
      message: 'Location updated successfully',
      data: { location: profile.currentLocation },
    };
  }

  /**
   * Get active deliveries
   * GET /courier/deliveries/active
   */
  @Get('deliveries/active')
  @Roles('courier')
  async getActiveDeliveries(@CurrentUser() user: any) {
    const orders = await this.courierService.getActiveDeliveries(user.sub);
    return {
      success: true,
      data: orders,
    };
  }

  /**
   * Get delivery history
   * GET /courier/deliveries/history
   */
  @Get('deliveries/history')
  @Roles('courier')
  async getDeliveryHistory(
    @CurrentUser() user: any,
    @Query('limit') limit?: string,
  ) {
    const orders = await this.courierService.getDeliveryHistory(
      user.sub,
      limit ? parseInt(limit) : 50,
    );
    return {
      success: true,
      data: orders,
    };
  }

  /**
   * Get earnings summary
   * GET /courier/earnings
   */
  @Get('earnings')
  @Roles('courier')
  async getEarnings(@CurrentUser() user: any) {
    const earnings = await this.courierService.getEarningsSummary(user.sub);
    return {
      success: true,
      data: earnings,
    };
  }

  /**
   * Accept assigned order
   * POST /courier/orders/:orderId/accept
   */
  @Post('orders/:orderId/accept')
  @Roles('courier')
  @HttpCode(HttpStatus.OK)
  async acceptOrder(
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
    @Body() dto: { notes?: string },
  ) {
    const order = await this.courierService.acceptOrder(
      user.sub,
      orderId,
      dto.notes,
    );
    return {
      success: true,
      message: 'Order accepted successfully',
      data: order,
    };
  }

  /**
   * Reject assigned order
   * POST /courier/orders/:orderId/reject
   */
  @Post('orders/:orderId/reject')
  @Roles('courier')
  @HttpCode(HttpStatus.OK)
  async rejectOrder(
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
    @Body() dto: { reason: string },
  ) {
    await this.courierService.rejectOrder(user.sub, orderId, dto.reason);
    return {
      success: true,
      message: 'Order rejected successfully',
    };
  }

  /**
   * Update delivery status
   * PUT /courier/orders/:orderId/status
   */
  @Put('orders/:orderId/status')
  @Roles('courier')
  async updateDeliveryStatus(
    @CurrentUser() user: any,
    @Param('orderId') orderId: string,
    @Body() updateDto: UpdateDeliveryStatusDto,
  ) {
    const order = await this.courierService.updateDeliveryStatus(
      user.sub,
      orderId,
      updateDto,
    );
    return {
      success: true,
      message: 'Delivery status updated successfully',
      data: order,
    };
  }
}
