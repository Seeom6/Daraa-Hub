import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { StoreAnalyticsDocument } from '../../../../database/schemas/store-analytics.schema';
import { StoreAnalytics } from '../../../../database/schemas/store-analytics.schema';
import { AnalyticsPeriod } from '../../../../database/schemas/product-analytics.schema';
import { QueryAnalyticsDto } from '../dto';
import { StoreAnalyticsRepository } from '../repositories/analytics.repository';

/**
 * Service for managing store analytics and dashboard metrics
 * Handles store performance, revenue tracking, and dashboard data
 */
@Injectable()
export class StoreAnalyticsService {
  constructor(
    private readonly storeAnalyticsRepository: StoreAnalyticsRepository,
  ) {}

  /**
   * Update store analytics for a specific period
   */
  async updateStoreAnalytics(
    storeId: string,
    period: AnalyticsPeriod,
    updates: Partial<StoreAnalytics>,
  ): Promise<StoreAnalyticsDocument> {
    const date = this.getPeriodStartDate(period);

    const analytics = await this.storeAnalyticsRepository
      .getModel()
      .findOneAndUpdate(
        {
          storeId: new Types.ObjectId(storeId),
          period,
          date,
        },
        {
          $inc: updates,
          $setOnInsert: {
            storeId: new Types.ObjectId(storeId),
            period,
            date,
          },
        },
        { upsert: true, new: true },
      );

    // Calculate derived metrics
    if (analytics.totalOrders > 0) {
      analytics.averageOrderValue =
        analytics.totalRevenue / analytics.totalOrders;
    }
    analytics.netRevenue = analytics.totalRevenue - analytics.totalCommission;
    await analytics.save();

    return analytics;
  }

  /**
   * Get store analytics with pagination and filters
   */
  async getStoreAnalytics(
    query: QueryAnalyticsDto,
  ): Promise<{ data: StoreAnalyticsDocument[]; meta: any }> {
    const { page = 1, limit = 10, period, startDate, endDate, storeId } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (storeId) filter.storeId = new Types.ObjectId(storeId);
    if (period) filter.period = period;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.storeAnalyticsRepository
        .getModel()
        .find(filter)
        .populate('storeId', 'storeName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.storeAnalyticsRepository.count(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get dashboard metrics based on user role
   */
  async getDashboardMetrics(userId: string, role: string): Promise<any> {
    if (role === 'store_owner') {
      return this.getStoreDashboard(userId);
    } else if (role === 'admin') {
      return this.getAdminDashboard();
    }

    return {};
  }

  /**
   * Get store owner dashboard metrics
   */
  private async getStoreDashboard(storeId: string): Promise<any> {
    const today = this.getPeriodStartDate(AnalyticsPeriod.DAILY);

    const [todayAnalytics, monthlyAnalytics] = await Promise.all([
      this.storeAnalyticsRepository.findOne({
        storeId: new Types.ObjectId(storeId),
        period: AnalyticsPeriod.DAILY,
        date: today,
      }),
      this.storeAnalyticsRepository.findOne({
        storeId: new Types.ObjectId(storeId),
        period: AnalyticsPeriod.MONTHLY,
        date: this.getPeriodStartDate(AnalyticsPeriod.MONTHLY),
      }),
    ]);

    return {
      today: todayAnalytics || {},
      monthly: monthlyAnalytics || {},
    };
  }

  /**
   * Get admin dashboard metrics (platform-wide)
   */
  private async getAdminDashboard(): Promise<any> {
    const today = this.getPeriodStartDate(AnalyticsPeriod.DAILY);

    const todayStats = await this.storeAnalyticsRepository
      .getModel()
      .aggregate([
        {
          $match: {
            period: AnalyticsPeriod.DAILY,
            date: today,
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: '$totalOrders' },
            totalRevenue: { $sum: '$totalRevenue' },
            totalCommission: { $sum: '$totalCommission' },
          },
        },
      ]);

    return todayStats[0] || {};
  }

  /**
   * Get period start date based on period type
   */
  private getPeriodStartDate(period: AnalyticsPeriod): Date {
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (period === AnalyticsPeriod.WEEKLY) {
      const day = date.getDay();
      const diff = date.getDate() - day;
      return new Date(date.setDate(diff));
    } else if (period === AnalyticsPeriod.MONTHLY) {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }

    return date; // Daily
  }
}
