import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreAnalyticsDocument = StoreAnalytics & Document;

export enum AnalyticsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Schema({ timestamps: true, collection: 'storeanalytics' })
export class StoreAnalytics {
  @Prop({ type: Types.ObjectId, ref: 'StoreOwnerProfile', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, enum: AnalyticsPeriod })
  period: AnalyticsPeriod;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ default: 0 })
  totalOrders: number;

  @Prop({ default: 0 })
  totalRevenue: number;

  @Prop({ default: 0 })
  totalCommission: number;

  @Prop({ default: 0 })
  netRevenue: number;

  @Prop({ default: 0 })
  averageOrderValue: number;

  @Prop({ default: 0 })
  conversionRate: number;

  @Prop({ default: 0 })
  customerRetentionRate: number;

  @Prop({ default: 0 })
  newCustomers: number;

  @Prop({ default: 0 })
  returningCustomers: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const StoreAnalyticsSchema = SchemaFactory.createForClass(StoreAnalytics);

// Indexes
StoreAnalyticsSchema.index({ storeId: 1, period: 1, date: -1 });
StoreAnalyticsSchema.index({ date: -1 });

