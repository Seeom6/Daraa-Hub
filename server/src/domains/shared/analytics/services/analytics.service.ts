import { Injectable } from '@nestjs/common';
import { UserActivityDocument } from '../../../../database/schemas/user-activity.schema';
import {
  ProductAnalytics,
  ProductAnalyticsDocument,
  AnalyticsPeriod,
} from '../../../../database/schemas/product-analytics.schema';
import {
  StoreAnalytics,
  StoreAnalyticsDocument,
} from '../../../../database/schemas/store-analytics.schema';
import { TrackEventDto, QueryAnalyticsDto } from '../dto';
import { UserActivityService } from './user-activity.service';
import { ProductAnalyticsService } from './product-analytics.service';
import { StoreAnalyticsService } from './store-analytics.service';

/**
 * Analytics Facade Service
 * Provides unified access to all analytics sub-services
 * Maintains backward compatibility with existing code
 */
@Injectable()
export class AnalyticsService {
  constructor(
    private readonly userActivityService: UserActivityService,
    private readonly productAnalyticsService: ProductAnalyticsService,
    private readonly storeAnalyticsService: StoreAnalyticsService,
  ) {}

  // ==================== User Activity ====================

  /**
   * Track user event
   */
  async trackEvent(
    userId: string,
    trackEventDto: TrackEventDto,
    deviceInfo?: any,
    locationInfo?: any,
  ): Promise<UserActivityDocument> {
    return this.userActivityService.trackEvent(
      userId,
      trackEventDto,
      deviceInfo,
      locationInfo,
    );
  }

  /**
   * Get user activity
   */
  async getUserActivity(
    userId: string,
    query: QueryAnalyticsDto,
  ): Promise<{ data: UserActivityDocument[]; meta: any }> {
    return this.userActivityService.getUserActivity(userId, query);
  }

  // ==================== Product Analytics ====================

  /**
   * Update product analytics
   */
  async updateProductAnalytics(
    productId: string,
    storeId: string,
    period: AnalyticsPeriod,
    updates: Partial<ProductAnalytics>,
  ): Promise<ProductAnalyticsDocument> {
    return this.productAnalyticsService.updateProductAnalytics(
      productId,
      storeId,
      period,
      updates,
    );
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(
    query: QueryAnalyticsDto,
  ): Promise<{ data: ProductAnalyticsDocument[]; meta: any }> {
    return this.productAnalyticsService.getProductAnalytics(query);
  }

  // ==================== Store Analytics ====================

  /**
   * Update store analytics
   */
  async updateStoreAnalytics(
    storeId: string,
    period: AnalyticsPeriod,
    updates: Partial<StoreAnalytics>,
  ): Promise<StoreAnalyticsDocument> {
    return this.storeAnalyticsService.updateStoreAnalytics(
      storeId,
      period,
      updates,
    );
  }

  /**
   * Get store analytics
   */
  async getStoreAnalytics(
    query: QueryAnalyticsDto,
  ): Promise<{ data: StoreAnalyticsDocument[]; meta: any }> {
    return this.storeAnalyticsService.getStoreAnalytics(query);
  }

  // ==================== Dashboard ====================

  /**
   * Get dashboard metrics
   */
  async getDashboardMetrics(userId: string, role: string): Promise<any> {
    return this.storeAnalyticsService.getDashboardMetrics(userId, role);
  }
}
