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
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OrderService } from './services/order.service';
import { CreateOrderDto, UpdateOrderStatusDto, CancelOrderDto } from './dto';
import { OrderStatus } from '../../../database/schemas/order.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create order from cart (Customer)
   * POST /orders
   */
  @Post()
  @Roles('customer')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(@CurrentUser() user: any, @Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.createOrder(user.profileId, createOrderDto);
    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  /**
   * Get customer orders (Customer)
   * GET /orders/my-orders
   */
  @Get('my-orders')
  @Roles('customer')
  async getMyOrders(
    @CurrentUser() user: any,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.orderService.getCustomerOrders(user.profileId, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Get store orders (Store Owner)
   * GET /orders/store-orders
   */
  @Get('store-orders')
  @Roles('store_owner')
  async getStoreOrders(
    @CurrentUser() user: any,
    @Query('status') status?: OrderStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.orderService.getStoreOrders(user.profileId, {
      status,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return {
      success: true,
      data: result.data,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Get order by ID
   * GET /orders/:id
   */
  @Get(':id')
  @Roles('customer', 'store_owner', 'admin')
  async getOrder(@CurrentUser() user: any, @Param('id') id: string) {
    const order = await this.orderService.findOne(id);

    // Authorization check
    // customerId and storeId are populated, so we need to get the _id
    const customerIdStr = order.customerId && typeof order.customerId === 'object'
      ? (order.customerId as any)._id.toString()
      : (order.customerId as any)?.toString();

    const storeIdStr = order.storeId && typeof order.storeId === 'object'
      ? (order.storeId as any)._id.toString()
      : (order.storeId as any)?.toString();

    if (
      user.role === 'customer' &&
      customerIdStr &&
      customerIdStr !== user.profileId
    ) {
      throw new UnauthorizedException('You are not authorized to view this order');
    }

    if (
      user.role === 'store_owner' &&
      storeIdStr &&
      storeIdStr !== user.profileId
    ) {
      throw new UnauthorizedException('You are not authorized to view this order');
    }

    return {
      success: true,
      data: order,
    };
  }

  /**
   * Update order status (Store Owner, Admin)
   * PUT /orders/:id/status
   */
  @Put(':id/status')
  @Roles('store_owner', 'admin')
  async updateOrderStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    const order = await this.orderService.updateStatus(id, updateDto, user.userId);
    return {
      success: true,
      message: 'Order status updated successfully',
      data: order,
    };
  }

  /**
   * Cancel order (Customer, Store Owner, Admin)
   * PUT /orders/:id/cancel
   */
  @Put(':id/cancel')
  @Roles('customer', 'store_owner', 'admin')
  async cancelOrder(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() cancelDto: CancelOrderDto,
  ) {
    const order = await this.orderService.cancelOrder(id, cancelDto, user.userId);
    return {
      success: true,
      message: 'Order cancelled successfully',
      data: order,
    };
  }
}

