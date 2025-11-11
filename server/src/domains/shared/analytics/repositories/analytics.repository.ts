import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProductAnalytics,
  ProductAnalyticsDocument,
} from '../../../../database/schemas/product-analytics.schema';
import {
  StoreAnalytics,
  StoreAnalyticsDocument,
} from '../../../../database/schemas/store-analytics.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class ProductAnalyticsRepository extends BaseRepository<ProductAnalyticsDocument> {
  constructor(
    @InjectModel(ProductAnalytics.name)
    private readonly productAnalyticsModel: Model<ProductAnalyticsDocument>,
  ) {
    super(productAnalyticsModel);
  }

  /**
   * Find analytics by product ID
   */
  async findByProductId(productId: string): Promise<ProductAnalyticsDocument | null> {
    return this.findOne({ productId: new Types.ObjectId(productId) });
  }

  /**
   * Increment view count
   */
  async incrementViews(productId: string): Promise<ProductAnalyticsDocument | null> {
    return this.productAnalyticsModel.findOneAndUpdate(
      { productId: new Types.ObjectId(productId) },
      { $inc: { views: 1 } },
      { new: true, upsert: true },
    );
  }

  /**
   * Increment add to cart count
   */
  async incrementAddToCart(productId: string): Promise<ProductAnalyticsDocument | null> {
    return this.productAnalyticsModel.findOneAndUpdate(
      { productId: new Types.ObjectId(productId) },
      { $inc: { addToCart: 1 } },
      { new: true, upsert: true },
    );
  }

  /**
   * Increment purchase count
   */
  async incrementPurchases(productId: string, quantity: number = 1): Promise<ProductAnalyticsDocument | null> {
    return this.productAnalyticsModel.findOneAndUpdate(
      { productId: new Types.ObjectId(productId) },
      { $inc: { purchases: quantity } },
      { new: true, upsert: true },
    );
  }
}

@Injectable()
export class StoreAnalyticsRepository extends BaseRepository<StoreAnalyticsDocument> {
  constructor(
    @InjectModel(StoreAnalytics.name)
    private readonly storeAnalyticsModel: Model<StoreAnalyticsDocument>,
  ) {
    super(storeAnalyticsModel);
  }

  /**
   * Find analytics by store ID
   */
  async findByStoreId(storeId: string): Promise<StoreAnalyticsDocument | null> {
    return this.findOne({ storeId: new Types.ObjectId(storeId) });
  }

  /**
   * Update revenue
   */
  async updateRevenue(
    storeId: string,
    amount: number,
  ): Promise<StoreAnalyticsDocument | null> {
    return this.storeAnalyticsModel.findOneAndUpdate(
      { storeId: new Types.ObjectId(storeId) },
      { $inc: { totalRevenue: amount } },
      { new: true, upsert: true },
    );
  }

  /**
   * Increment order count
   */
  async incrementOrders(storeId: string): Promise<StoreAnalyticsDocument | null> {
    return this.storeAnalyticsModel.findOneAndUpdate(
      { storeId: new Types.ObjectId(storeId) },
      { $inc: { totalOrders: 1 } },
      { new: true, upsert: true },
    );
  }
}

