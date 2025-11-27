import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CourierService } from '../services/courier.service';
import { CourierAdminService } from '../services/courier-admin.service';
import { JwtAuthGuard } from '../../../../common/guards';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { AssignOrderDto } from '../dto';

/**
 * Courier Admin Controller
 * Handles admin operations for courier management
 */
@Controller('admin/couriers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'store_owner')
export class CourierAdminController {
  constructor(
    private readonly courierService: CourierService,
    private readonly courierAdminService: CourierAdminService,
  ) {}

  /**
   * Get all couriers
   * GET /admin/couriers
   */
  @Get()
  @Roles('admin')
  async getAllCouriers(
    @Query('status') status?: string,
    @Query('verificationStatus') verificationStatus?: string,
    @Query('limit') limit?: string,
  ) {
    const couriers = await this.courierAdminService.getAllCouriers({
      status,
      verificationStatus,
      limit: limit ? parseInt(limit) : 50,
    });
    return {
      success: true,
      data: couriers,
    };
  }

  /**
   * Get courier by ID
   * GET /admin/couriers/:id
   */
  @Get(':id')
  @Roles('admin')
  async getCourierById(@Param('id') id: string) {
    const courier = await this.courierService.getProfileById(id);
    return {
      success: true,
      data: courier,
    };
  }

  /**
   * Assign order to courier
   * POST /admin/couriers/assign-order
   */
  @Post('assign-order')
  @Roles('admin', 'store_owner')
  @HttpCode(HttpStatus.OK)
  async assignOrder(
    @CurrentUser() user: any,
    @Body() assignDto: AssignOrderDto,
  ) {
    const order = await this.courierAdminService.assignOrderToCourier(
      assignDto.orderId,
      assignDto.courierId,
      user.sub,
    );
    return {
      success: true,
      message: 'Order assigned to courier successfully',
      data: order,
    };
  }

  /**
   * Find available couriers for order
   * GET /admin/couriers/available/:orderId
   */
  @Get('available/:orderId')
  @Roles('admin', 'store_owner')
  async findAvailableCouriersForOrder(@Param('orderId') orderId: string) {
    const couriers = await this.courierAdminService.findAvailableCouriersForOrder(orderId);
    return {
      success: true,
      data: couriers,
    };
  }

  /**
   * Suspend courier
   * PUT /admin/couriers/:id/suspend
   */
  @Put(':id/suspend')
  @Roles('admin')
  async suspendCourier(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: { reason: string },
  ) {
    const courier = await this.courierAdminService.suspendCourier(
      id,
      user.sub,
      dto.reason,
    );
    return {
      success: true,
      message: 'Courier suspended successfully',
      data: courier,
    };
  }

  /**
   * Unsuspend courier
   * PUT /admin/couriers/:id/unsuspend
   */
  @Put(':id/unsuspend')
  @Roles('admin')
  async unsuspendCourier(@Param('id') id: string) {
    const courier = await this.courierAdminService.unsuspendCourier(id);
    return {
      success: true,
      message: 'Courier unsuspended successfully',
      data: courier,
    };
  }

  /**
   * Update courier commission rate
   * PUT /admin/couriers/:id/commission
   */
  @Put(':id/commission')
  @Roles('admin')
  async updateCommissionRate(
    @Param('id') id: string,
    @Body() dto: { commissionRate: number },
  ) {
    const courier = await this.courierAdminService.updateCommissionRate(
      id,
      dto.commissionRate,
    );
    return {
      success: true,
      message: 'Commission rate updated successfully',
      data: courier,
    };
  }

  /**
   * Get courier statistics
   * GET /admin/couriers/:id/statistics
   */
  @Get(':id/statistics')
  @Roles('admin')
  async getCourierStatistics(@Param('id') id: string) {
    const stats = await this.courierAdminService.getCourierStatistics(id);
    return {
      success: true,
      data: stats,
    };
  }
}

