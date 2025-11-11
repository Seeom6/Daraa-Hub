import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OfferDocument = Offer & Document;

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
}

@Schema({ timestamps: true })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: 'StoreOwnerProfile', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  image?: string; // Offer banner image URL

  @Prop({ type: String, enum: DiscountType, required: true })
  discountType: DiscountType;

  @Prop({ required: true, min: 0 })
  discountValue: number; // Percentage (0-100) or fixed amount

  @Prop({ default: 0, min: 0 })
  minPurchaseAmount: number;

  @Prop({ default: null, min: 0 })
  maxDiscountAmount?: number; // Maximum discount cap (for percentage offers)

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  applicableProducts: Types.ObjectId[]; // Empty array = all products in store

  @Prop({ required: true, index: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({ default: true, index: true })
  isActive: boolean;

  @Prop({ default: 0, min: 0 })
  viewCount: number;

  @Prop({ default: 0, min: 0 })
  usageCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);

// Indexes
OfferSchema.index({ storeId: 1, isActive: 1 });
OfferSchema.index({ startDate: 1, endDate: 1 });
OfferSchema.index({ applicableProducts: 1 });

