import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  FREE_SHIPPING = 'free_shipping',
  BUY_X_GET_Y = 'buy_x_get_y',
}

@Schema({ _id: false })
export class UsageLimit {
  @Prop({ default: null })
  total?: number; // Total usage limit (null = unlimited)

  @Prop({ default: null })
  perUser?: number; // Per user limit (null = unlimited)

  @Prop({ default: null })
  perDay?: number; // Daily limit (null = unlimited)
}

@Schema({ _id: false })
export class ApplicableTo {
  @Prop({ type: [Types.ObjectId], ref: 'StoreOwnerProfile', default: [] })
  stores: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Category', default: [] })
  categories: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  products: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  userTiers: string[]; // ['bronze', 'silver', 'gold', 'platinum']

  @Prop({ default: false })
  newUsersOnly: boolean;
}

@Schema({ _id: false })
export class UsageHistoryItem {
  @Prop({ type: Types.ObjectId, ref: 'CustomerProfile', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({ required: true })
  discountAmount: number;

  @Prop({ required: true, default: Date.now })
  usedAt: Date;
}

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ type: String, enum: CouponType, required: true })
  type: CouponType;

  @Prop({ required: true, min: 0 })
  discountValue: number; // Percentage (0-100) or fixed amount

  @Prop({ default: 0, min: 0 })
  minPurchaseAmount: number;

  @Prop({ default: null, min: 0 })
  maxDiscountAmount?: number; // Maximum discount cap (for percentage coupons)

  @Prop({ type: UsageLimit, default: () => ({}) })
  usageLimit: UsageLimit;

  @Prop({ default: 0, min: 0 })
  usedCount: number;

  @Prop({ required: true, index: true })
  validFrom: Date;

  @Prop({ required: true, index: true })
  validUntil: Date;

  @Prop({ type: ApplicableTo, default: () => ({}) })
  applicableTo: ApplicableTo;

  @Prop({ default: false })
  autoApply: boolean; // Auto-apply if conditions met

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'AdminProfile', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [UsageHistoryItem], default: [] })
  usageHistory: UsageHistoryItem[];

  createdAt: Date;
  updatedAt: Date;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);

// Indexes
CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });
CouponSchema.index({ 'applicableTo.stores': 1 });
CouponSchema.index({ 'applicableTo.categories': 1 });
CouponSchema.index({ 'applicableTo.products': 1 });

