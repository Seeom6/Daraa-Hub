import {
  Controller,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { StoreSettingsService } from '../services/store-settings.service';
import { UpdateStoreSettingsDto } from '../dto';

@Controller('store-settings')
export class StoreSettingsController {
  constructor(private readonly storeSettingsService: StoreSettingsService) {}

  /**
   * Get store settings (for store owner)
   * GET /store-settings/:storeId
   * Requires: Store Owner (own store) or Admin
   */
  @Get(':storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async getSettings(
    @Param('storeId') storeId: string,
    @CurrentUser() user: any,
  ) {
    // Verify ownership if store owner
    if (user.role === 'store_owner' && user.profileId !== storeId) {
      throw new ForbiddenException('You can only access your own store settings');
    }

    const settings = await this.storeSettingsService.getOrCreate(storeId);
    return {
      success: true,
      data: settings,
    };
  }

  /**
   * Get public store settings
   * GET /store-settings/:storeId/public
   * Public endpoint
   */
  @Get(':storeId/public')
  async getPublicSettings(@Param('storeId') storeId: string) {
    const settings = await this.storeSettingsService.getPublicSettings(storeId);
    return {
      success: true,
      data: settings,
    };
  }

  /**
   * Update store settings
   * PUT /store-settings/:storeId
   * Requires: Store Owner (own store) or Admin
   */
  @Put(':storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async updateSettings(
    @Param('storeId') storeId: string,
    @Body() updateStoreSettingsDto: UpdateStoreSettingsDto,
    @CurrentUser() user: any,
  ) {
    // Verify ownership if store owner
    if (user.role === 'store_owner' && user.profileId !== storeId) {
      throw new ForbiddenException('You can only update your own store settings');
    }

    const settings = await this.storeSettingsService.update(
      storeId,
      updateStoreSettingsDto,
      user.userId,
    );

    return {
      success: true,
      message: 'Store settings updated successfully',
      data: settings,
    };
  }

  /**
   * Check if store is open
   * GET /store-settings/:storeId/is-open
   * Public endpoint
   */
  @Get(':storeId/is-open')
  async isStoreOpen(@Param('storeId') storeId: string) {
    const isOpen = await this.storeSettingsService.isStoreOpen(storeId);
    return {
      success: true,
      data: { isOpen },
    };
  }

  /**
   * Calculate shipping fee
   * GET /store-settings/:storeId/shipping-fee
   * Public endpoint
   */
  @Get(':storeId/shipping-fee')
  async calculateShippingFee(
    @Param('storeId') storeId: string,
    @Query('city') city: string,
    @Query('orderTotal') orderTotal: string,
  ) {
    const total = parseFloat(orderTotal) || 0;
    const shippingFee = await this.storeSettingsService.calculateShippingFee(
      storeId,
      city,
      total,
    );

    return {
      success: true,
      data: { shippingFee },
    };
  }
}

