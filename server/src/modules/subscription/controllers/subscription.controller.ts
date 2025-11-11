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
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from '../dto';
import { SubscriptionStatus } from '../../../database/schemas/store-subscription.schema';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Create subscription (Admin only)
   * POST /subscriptions
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    const subscription = await this.subscriptionService.create(createDto, user.userId);
    return {
      success: true,
      message: 'Subscription created successfully',
      data: subscription,
    };
  }

  /**
   * Get all subscriptions (Admin only)
   * GET /subscriptions
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(
    @Query('status') status?: SubscriptionStatus,
    @Query('storeId') storeId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.subscriptionService.findAll({
      status,
      storeId,
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
   * Get subscription by ID (Admin only)
   * GET /subscriptions/:id
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const subscription = await this.subscriptionService.findOne(id);
    return {
      success: true,
      data: subscription,
    };
  }

  /**
   * Get store's active subscription (Store Owner)
   * GET /subscriptions/store/:storeId/active
   */
  @Get('store/:storeId/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async getActiveSubscription(@Param('storeId') storeId: string) {
    const subscription = await this.subscriptionService.getActiveSubscription(storeId);
    return {
      success: true,
      data: subscription,
    };
  }

  /**
   * Get all subscriptions for a store (Store Owner, Admin)
   * GET /subscriptions/store/:storeId
   */
  @Get('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async getStoreSubscriptions(@Param('storeId') storeId: string) {
    const subscriptions = await this.subscriptionService.getStoreSubscriptions(storeId);
    return {
      success: true,
      data: subscriptions,
    };
  }

  /**
   * Update subscription (Admin only)
   * PUT /subscriptions/:id
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionDto,
    @CurrentUser() user: any,
  ) {
    const subscription = await this.subscriptionService.update(id, updateDto, user.userId);
    return {
      success: true,
      message: 'Subscription updated successfully',
      data: subscription,
    };
  }
}

