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
} from '@nestjs/common';
import { CouponService } from '../services/coupon.service';
import { CouponValidationService } from '../services/coupon-validation.service';
import { CouponUsageService } from '../services/coupon-usage.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { QueryCouponDto } from '../dto/query-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../common/guards/roles.guard';
import { Roles } from '../../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CouponController {
  constructor(
    private readonly couponService: CouponService,
    private readonly couponValidationService: CouponValidationService,
    private readonly couponUsageService: CouponUsageService,
  ) {}

  /**
   * Validate coupon code
   * POST /coupons/validate
   */
  @Post('validate')
  @Roles('customer')
  async validateCoupon(
    @CurrentUser() user: any,
    @Body() validateDto: ValidateCouponDto,
  ) {
    validateDto.customerId = user.profileId;
    const result =
      await this.couponValidationService.validateCoupon(validateDto);
    return {
      success: result.valid,
      message: result.message,
      data: result.valid
        ? {
            discountAmount: result.discountAmount,
            coupon: result.coupon,
          }
        : null,
    };
  }

  /**
   * Get available coupons for current user
   * GET /coupons/available
   */
  @Get('available')
  @Roles('customer')
  async getAvailableCoupons(@CurrentUser() user: any) {
    const coupons = await this.couponValidationService.getAvailableCoupons(
      user.profileId,
    );
    return {
      success: true,
      data: coupons,
    };
  }

  /**
   * Admin: Create coupon
   * POST /coupons/admin
   */
  @Post('admin')
  @Roles('admin')
  async createCoupon(
    @CurrentUser() user: any,
    @Body() createDto: CreateCouponDto,
  ) {
    const coupon = await this.couponService.create(createDto, user.profileId);
    return {
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    };
  }

  /**
   * Admin: Get all coupons
   * GET /coupons/admin
   */
  @Get('admin')
  @Roles('admin')
  async getAllCoupons(@Query() queryDto: QueryCouponDto) {
    const result = await this.couponService.findAll(queryDto);
    return {
      success: true,
      ...result,
    };
  }

  /**
   * Admin: Get coupon by ID
   * GET /coupons/admin/:id
   */
  @Get('admin/:id')
  @Roles('admin')
  async getCoupon(@Param('id') id: string) {
    const coupon = await this.couponService.findOne(id);
    return {
      success: true,
      data: coupon,
    };
  }

  /**
   * Admin: Update coupon
   * PUT /coupons/admin/:id
   */
  @Put('admin/:id')
  @Roles('admin')
  async updateCoupon(
    @Param('id') id: string,
    @Body() updateDto: UpdateCouponDto,
  ) {
    const coupon = await this.couponService.update(id, updateDto);
    return {
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    };
  }

  /**
   * Admin: Delete coupon
   * DELETE /coupons/admin/:id
   */
  @Delete('admin/:id')
  @Roles('admin')
  async deleteCoupon(@Param('id') id: string) {
    await this.couponService.remove(id);
    return {
      success: true,
      message: 'Coupon deleted successfully',
    };
  }

  /**
   * Admin: Get coupon usage statistics
   * GET /coupons/admin/:id/usage
   */
  @Get('admin/:id/usage')
  @Roles('admin')
  async getCouponUsageStats(@Param('id') id: string) {
    const stats = await this.couponUsageService.getUsageStats(id);
    return {
      success: true,
      data: stats,
    };
  }
}
