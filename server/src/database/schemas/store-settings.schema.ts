import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreSettingsDocument = StoreSettings & Document;

export interface BusinessHours {
  day: string; // 'monday', 'tuesday', etc.
  isOpen: boolean;
  openTime?: string; // '09:00'
  closeTime?: string; // '18:00'
}

export interface ShippingZone {
  name: string;
  cities: string[];
  shippingFee: number;
  freeShippingThreshold?: number;
  estimatedDays: number;
}

export interface StorePaymentMethod {
  method: string; // 'cash_on_delivery', 'bank_transfer', 'online_payment'
  isEnabled: boolean;
  details?: string;
}

@Schema({ timestamps: true })
export class StoreSettings {
  @Prop({ type: Types.ObjectId, ref: 'StoreOwnerProfile', required: true, unique: true, index: true })
  storeId: Types.ObjectId;

  // Business Hours
  @Prop({
    type: [
      {
        day: { type: String, required: true },
        isOpen: { type: Boolean, default: true },
        openTime: String,
        closeTime: String,
      },
    ],
    default: [
      { day: 'sunday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { day: 'friday', isOpen: false },
      { day: 'saturday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
    ],
  })
  businessHours: BusinessHours[];

  // Shipping Settings
  @Prop({
    type: [
      {
        name: { type: String, required: true },
        cities: [String],
        shippingFee: { type: Number, required: true },
        freeShippingThreshold: Number,
        estimatedDays: { type: Number, required: true },
      },
    ],
    default: [],
  })
  shippingZones: ShippingZone[];

  @Prop({ default: 5000 })
  defaultShippingFee: number;

  @Prop({ default: 0 })
  freeShippingThreshold: number;

  // Payment Methods
  @Prop({
    type: [
      {
        method: { type: String, required: true },
        isEnabled: { type: Boolean, default: true },
        details: String,
      },
    ],
    default: [
      { method: 'cash_on_delivery', isEnabled: true },
      { method: 'bank_transfer', isEnabled: false },
      { method: 'online_payment', isEnabled: false },
    ],
  })
  paymentMethods: StorePaymentMethod[];

  // Order Settings
  @Prop({ default: 50 })
  minOrderAmount: number;

  @Prop({ default: 0 })
  maxOrderAmount: number; // 0 means no limit

  @Prop({ default: true })
  allowCashOnDelivery: boolean;

  @Prop({ default: 30 })
  orderCancellationPeriod: number; // in minutes

  // Return & Refund Policy
  @Prop({ default: 7 })
  returnPeriod: number; // in days

  @Prop({ default: true })
  allowReturns: boolean;

  @Prop()
  returnPolicy?: string;

  @Prop()
  refundPolicy?: string;

  // Store Policies
  @Prop()
  termsAndConditions?: string;

  @Prop()
  privacyPolicy?: string;

  @Prop()
  shippingPolicy?: string;

  // Notifications
  @Prop({ default: true })
  notifyOnNewOrder: boolean;

  @Prop({ default: true })
  notifyOnLowStock: boolean;

  @Prop({ default: true })
  notifyOnReview: boolean;

  // Tax Settings
  @Prop({ default: 0 })
  taxRate: number; // percentage

  @Prop({ default: false })
  includeTaxInPrice: boolean;

  // Points & Rewards
  @Prop({ default: false })
  enablePointsSystem: boolean;

  @Prop({ default: 1 })
  pointsPerCurrency: number; // 1 SYP = X points

  @Prop({ default: 100 })
  pointsRedemptionRate: number; // X points = 1 SYP

  // Social Media
  @Prop()
  facebookUrl?: string;

  @Prop()
  instagramUrl?: string;

  @Prop()
  whatsappNumber?: string;

  @Prop()
  telegramUrl?: string;

  // Other Settings
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  maintenanceMode: boolean;

  @Prop()
  maintenanceMessage?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const StoreSettingsSchema = SchemaFactory.createForClass(StoreSettings);

// Indexes
StoreSettingsSchema.index({ storeId: 1 }, { unique: true });

