import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ProductAnalyticsDocument,
  AnalyticsPeriod,
} from '../../../../database/schemas/product-analytics.schema';
import { ProductAnalytics } from '../../../../database/schemas/product-analytics.schema';
import { QueryAnalyticsDto } from '../dto';
import { ProductAnalyticsRepository } from '../repositories/analytics.repository';

/**
 * Service for managing product analytics
 * Handles product views, conversions, and performance metrics
 */
@Injectable()
export class ProductAnalyticsService {
  constructor(
    private readonly productAnalyticsRepository: ProductAnalyticsRepository,
  ) {}

  /**
   * Update product analytics for a specific period
   */
  async updateProductAnalytics(
    productId: string,
    storeId: string,
    period: AnalyticsPeriod,
    updates: Partial<ProductAnalytics>,
  ): Promise<ProductAnalyticsDocument> {
    const date = this.getPeriodStartDate(period);

    const analytics = await this.productAnalyticsRepository
      .getModel()
      .findOneAndUpdate(
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
      analytics.conversionRate =
        (analytics.purchaseCount / analytics.views) * 100;
      await analytics.save();
    }

    return analytics;
  }

  /**
   * Get product analytics with pagination and filters
   */
  async getProductAnalytics(
    query: QueryAnalyticsDto,
  ): Promise<{ data: ProductAnalyticsDocument[]; meta: any }> {
    const {
      page = 1,
      limit = 10,
      period,
      startDate,
      endDate,
      productId,
      storeId,
    } = query;
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
      this.productAnalyticsRepository
        .getModel()
        .find(filter)
        .populate('productId', 'name images')
        .populate('storeId', 'storeName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productAnalyticsRepository.count(filter),
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
