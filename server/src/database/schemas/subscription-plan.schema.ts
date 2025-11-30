import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SubscriptionPlanDocument = SubscriptionPlan & Document;

export enum PlanType {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
}

export interface PlanFeatures {
  dailyProductLimit: number;
  maxImagesPerProduct: number;
  maxVariantsPerProduct: number;
  prioritySupport: boolean;
  analyticsAccess: boolean;
  customDomain: boolean;
}

@Schema({ timestamps: true })
export class SubscriptionPlan {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, type: String, enum: PlanType })
  type: PlanType;

  @Prop({ trim: true })
  description?: string;

  @Prop({ required: true, min: 0 })
  priceUSD: number; // Price in USD

  @Prop({ required: true, min: 0 })
  priceSYP: number; // Price in Syrian Pounds (for display)

  @Prop({ required: true, default: 30, min: 1 })
  durationDays: number; // Default: 30 days (1 month)

  @Prop({
    type: {
      dailyProductLimit: { type: Number, required: true },
      maxImagesPerProduct: { type: Number, required: true },
      maxVariantsPerProduct: { type: Number, required: true },
      prioritySupport: { type: Boolean, default: false },
      analyticsAccess: { type: Boolean, default: false },
      customDomain: { type: Boolean, default: false },
    },
    required: true,
  })
  features: PlanFeatures;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  order: number; // Display order

  createdAt: Date;
  updatedAt: Date;
}

export const SubscriptionPlanSchema =
  SchemaFactory.createForClass(SubscriptionPlan);

// Indexes
// Note: type already has unique: true in @Prop, which creates an index automatically
SubscriptionPlanSchema.index({ isActive: 1, order: 1 });
