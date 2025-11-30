import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AddressDocument = Address & Document;

/**
 * Address Type - نوع العنوان
 */
export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  OTHER = 'other',
}

/**
 * GeoJSON Point for location
 */
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

/**
 * Address Schema
 * Reusable address system for customers
 * Supports geolocation for delivery optimization
 */
@Schema({ timestamps: true })
export class Address {
  @Prop({
    type: Types.ObjectId,
    ref: 'CustomerProfile',
    required: true,
  })
  customerId: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 100 })
  label: string; // e.g., "المنزل", "العمل", "بيت جدي"

  @Prop({
    type: String,
    enum: AddressType,
    default: AddressType.HOME,
  })
  type: AddressType;

  @Prop({ required: true, trim: true })
  fullName: string; // Recipient name

  @Prop({ required: true, trim: true })
  phoneNumber: string; // Recipient phone

  @Prop({ trim: true })
  alternatePhone?: string; // Backup phone number

  @Prop({ required: true, trim: true })
  city: string; // المدينة

  @Prop({ trim: true })
  district?: string; // الحي / المنطقة

  @Prop({ required: true, trim: true })
  street: string; // الشارع

  @Prop({ trim: true })
  building?: string; // رقم المبنى / اسم المبنى

  @Prop({ trim: true })
  floor?: string; // الطابق

  @Prop({ trim: true })
  apartment?: string; // رقم الشقة

  @Prop({ trim: true })
  nearbyLandmark?: string; // علامة مميزة قريبة

  @Prop({ required: true, trim: true })
  fullAddress: string; // العنوان الكامل (computed or manual)

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  })
  location?: GeoPoint; // GPS coordinates (optional)

  @Prop({ trim: true, maxlength: 500 })
  deliveryInstructions?: string; // تعليمات التوصيل

  @Prop({ default: false })
  isDefault: boolean; // العنوان الافتراضي

  @Prop({ default: true })
  isActive: boolean; // Soft delete support

  @Prop({ default: 0 })
  usageCount: number; // Track how often address is used

  @Prop()
  lastUsedAt?: Date; // Last time address was used for an order

  createdAt: Date;
  updatedAt: Date;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

// Indexes for performance
AddressSchema.index({ customerId: 1, isActive: 1 }); // Get customer addresses
AddressSchema.index({ customerId: 1, isDefault: 1 }); // Get default address quickly
AddressSchema.index({ location: '2dsphere' }); // Geospatial queries for delivery
AddressSchema.index({ city: 1 }); // Analytics by city
AddressSchema.index({ customerId: 1, usageCount: -1 }); // Get most used addresses

// Compound index for full address search
AddressSchema.index({
  customerId: 1,
  city: 1,
  district: 1,
  isActive: 1,
});
