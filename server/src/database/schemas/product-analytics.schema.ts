import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductAnalyticsDocument = ProductAnalytics & Document;

export enum AnalyticsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Schema({ timestamps: true, collection: 'productanalytics' })
export class ProductAnalytics {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StoreOwnerProfile', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, enum: AnalyticsPeriod })
  period: AnalyticsPeriod;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ default: 0 })
  views: number;

  @Prop({ default: 0 })
  uniqueViews: number;

  @Prop({ default: 0 })
  addToCartCount: number;

  @Prop({ default: 0 })
  purchaseCount: number;

  @Prop({ default: 0 })
  conversionRate: number;

  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProductAnalyticsSchema = SchemaFactory.createForClass(ProductAnalytics);

// Indexes
ProductAnalyticsSchema.index({ productId: 1, period: 1, date: -1 });
ProductAnalyticsSchema.index({ storeId: 1, period: 1, date: -1 });
ProductAnalyticsSchema.index({ date: -1 });

