import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  UserActivity,
  UserActivityDocument,
  EventType,
  DeviceType,
} from '../../../../database/schemas/user-activity.schema';
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

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(UserActivity.name)
    private userActivityModel: Model<UserActivityDocument>,
    @InjectModel(ProductAnalytics.name)
    private productAnalyticsModel: Model<ProductAnalyticsDocument>,
    @InjectModel(StoreAnalytics.name)
    private storeAnalyticsModel: Model<StoreAnalyticsDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Track user event
   */
  async trackEvent(
    userId: string,
    trackEventDto: TrackEventDto,
    deviceInfo?: any,
    locationInfo?: any,
  ): Promise<UserActivityDocument> {
    const { type, data, sessionId } = trackEventDto;

    // Find or create user activity session
    let userActivity = await this.userActivityModel.findOne({
      userId: new Types.ObjectId(userId),
      sessionId: sessionId || 'default',
    });

    const event = {
      type,
      data: data || {},
      timestamp: new Date(),
    };

    if (userActivity) {
      // Add event to existing session
      userActivity.events.push(event);
      await userActivity.save();
    } else {
      // Create new session
      userActivity = await this.userActivityModel.create({
        userId: new Types.ObjectId(userId),
        sessionId: sessionId || 'default',
        events: [event],
        device: deviceInfo || {
          type: DeviceType.DESKTOP,
          os: 'Unknown',
          browser: 'Unknown',
          userAgent: 'Unknown',
        },
        location: locationInfo || {
          city: 'Unknown',
          country: 'Unknown',
          ip: 'Unknown',
        },
      });
    }

    // Emit event for further processing
    this.eventEmitter.emit('analytics.event.tracked', {
      userId,
      type,
      data,
    });

    return userActivity;
  }

  /**
   * Get user activity
   */
  async getUserActivity(
    userId: string,
    query: QueryAnalyticsDto,
  ): Promise<{ data: UserActivityDocument[]; meta: any }> {
    const { page = 1, limit = 10, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    // Only filter by userId if provided
    if (userId) {
      filter.userId = new Types.ObjectId(userId);
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.userActivityModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userActivityModel.countDocuments(filter),
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
   * Update product analytics
   */
  async updateProductAnalytics(
    productId: string,
    storeId: string,
    period: AnalyticsPeriod,
    updates: Partial<ProductAnalytics>,
  ): Promise<ProductAnalyticsDocument> {
    const date = this.getPeriodStartDate(period);

    const analytics = await this.productAnalyticsModel.findOneAndUpdate(
      {
        productId: new Types.ObjectId(productId),
        storeId: new Types.ObjectId(storeId),
        period,
        date,
      },
      {
        $inc: updates,
        $setOnInsert: {
          productId: new Types.ObjectId(productId),
          storeId: new Types.ObjectId(storeId),
          period,
          date,
        },
      },
      { upsert: true, new: true },
    );

    // Calculate conversion rate
    if (analytics.views > 0) {
      analytics.conversionRate = (analytics.purchaseCount / analytics.views) * 100;
      await analytics.save();
    }

    return analytics;
  }

  /**
   * Get product analytics
   */
  async getProductAnalytics(
    query: QueryAnalyticsDto,
  ): Promise<{ data: ProductAnalyticsDocument[]; meta: any }> {
    const { page = 1, limit = 10, period, startDate, endDate, productId, storeId } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (productId) filter.productId = new Types.ObjectId(productId);
    if (storeId) filter.storeId = new Types.ObjectId(storeId);
    if (period) filter.period = period;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      this.productAnalyticsModel
        .find(filter)
        .populate('productId', 'name images')
        .populate('storeId', 'storeName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productAnalyticsModel.countDocuments(filter),
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
   * Update store analytics
   */
  async updateStoreAnalytics(
    storeId: string,
    period: AnalyticsPeriod,
    updates: Partial<StoreAnalytics>,
  ): Promise<StoreAnalyticsDocument> {
    const date = this.getPeriodStartDate(period);

    const analytics = await this.storeAnalyticsModel.findOneAndUpdate(
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
      analytics.averageOrderValue = analytics.totalRevenue / analytics.totalOrders;
    }
    analytics.netRevenue = analytics.totalRevenue - analytics.totalCommission;
    await analytics.save();

    return analytics;
  }

  /**
   * Get store analytics
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
      this.storeAnalyticsModel
        .find(filter)
        .populate('storeId', 'storeName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.storeAnalyticsModel.countDocuments(filter),
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
   * Get dashboard metrics
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
   * Get store owner dashboard
   */
  private async getStoreDashboard(storeId: string): Promise<any> {
    const today = this.getPeriodStartDate(AnalyticsPeriod.DAILY);

    const todayAnalytics = await this.storeAnalyticsModel.findOne({
      storeId: new Types.ObjectId(storeId),
      period: AnalyticsPeriod.DAILY,
      date: today,
    });

    const monthlyAnalytics = await this.storeAnalyticsModel.findOne({
      storeId: new Types.ObjectId(storeId),
      period: AnalyticsPeriod.MONTHLY,
      date: this.getPeriodStartDate(AnalyticsPeriod.MONTHLY),
    });

    return {
      today: todayAnalytics || {},
      monthly: monthlyAnalytics || {},
    };
  }

  /**
   * Get admin dashboard
   */
  private async getAdminDashboard(): Promise<any> {
    const today = this.getPeriodStartDate(AnalyticsPeriod.DAILY);

    const todayStats = await this.storeAnalyticsModel.aggregate([
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
   * Get period start date
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

