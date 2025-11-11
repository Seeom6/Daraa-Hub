import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AnalyticsService } from '../services/analytics.service';
import { TrackEventDto, QueryAnalyticsDto } from '../dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Track user event
   * POST /analytics/track
   * Requires: Any authenticated user
   */
  @Post('track')
  @UseGuards(JwtAuthGuard)
  async trackEvent(@Body() trackEventDto: TrackEventDto, @Req() req: any) {
    const userId = req.user.userId;
    const deviceInfo = {
      type: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
      os: 'Unknown',
      browser: 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    };
    const locationInfo = {
      city: 'Unknown',
      country: 'Unknown',
      ip: req.ip || 'Unknown',
    };

    const activity = await this.analyticsService.trackEvent(
      userId,
      trackEventDto,
      deviceInfo,
      locationInfo,
    );

    return {
      success: true,
      message: 'Event tracked successfully',
      data: activity,
    };
  }

  /**
   * Get my activity
   * GET /analytics/my-activity
   * Requires: Any authenticated user
   */
  @Get('my-activity')
  @UseGuards(JwtAuthGuard)
  async getMyActivity(@Query() query: QueryAnalyticsDto, @Req() req: any) {
    const userId = req.user.userId;
    const result = await this.analyticsService.getUserActivity(userId, query);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get product analytics
   * GET /analytics/products
   * Requires: Store Owner or Admin
   */
  @Get('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async getProductAnalytics(@Query() query: QueryAnalyticsDto, @Req() req: any) {
    // If store owner, filter by their store
    if (req.user.role === 'store_owner') {
      query.storeId = req.user.profileId;
    }

    const result = await this.analyticsService.getProductAnalytics(query);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get store analytics
   * GET /analytics/stores
   * Requires: Store Owner or Admin
   */
  @Get('stores')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async getStoreAnalytics(@Query() query: QueryAnalyticsDto, @Req() req: any) {
    // If store owner, filter by their store
    if (req.user.role === 'store_owner') {
      query.storeId = req.user.profileId;
    }

    const result = await this.analyticsService.getStoreAnalytics(query);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }

  /**
   * Get dashboard metrics
   * GET /analytics/dashboard
   * Requires: Store Owner or Admin
   */
  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('store_owner', 'admin')
  async getDashboard(@Req() req: any) {
    const userId = req.user.profileId;
    const role = req.user.role;

    const metrics = await this.analyticsService.getDashboardMetrics(userId, role);

    return {
      success: true,
      data: metrics,
    };
  }

  /**
   * Get all user activities (Admin only)
   * GET /analytics/admin/activities
   * Requires: Admin
   */
  @Get('admin/activities')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllActivities(@Query() query: QueryAnalyticsDto) {
    // Admin can see all activities without userId filter
    const result = await this.analyticsService.getUserActivity('', query);

    return {
      success: true,
      data: result.data,
      meta: result.meta,
    };
  }
}

