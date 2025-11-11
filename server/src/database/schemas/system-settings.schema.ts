import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SystemSettingsDocument = SystemSettings & Document;

/**
 * System Settings Schema
 * Centralized configuration for the entire platform
 */
@Schema({ timestamps: true })
export class SystemSettings {
  @Prop({ required: true, unique: true, index: true })
  key: string; // e.g., 'general', 'payment', 'shipping', 'notifications'

  @Prop({ 
    type: String, 
    enum: ['general', 'payment', 'shipping', 'notifications', 'security', 'commission', 'features'],
    required: true,
  })
  category: 'general' | 'payment' | 'shipping' | 'notifications' | 'security' | 'commission' | 'features';

  @Prop({ type: Object, required: true })
  value: Record<string, any>;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  lastModifiedBy?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);

// Indexes
SystemSettingsSchema.index({ key: 1 });
SystemSettingsSchema.index({ category: 1 });

// Default settings structure examples:

/**
 * General Settings
 * {
 *   key: 'general',
 *   category: 'general',
 *   value: {
 *     platformName: 'Daraa',
 *     platformNameAr: 'درعا',
 *     supportEmail: 'support@daraa.com',
 *     supportPhone: '+963XXXXXXXXX',
 *     currency: 'SYP',
 *     language: 'ar',
 *     timezone: 'Asia/Damascus',
 *     maintenanceMode: false,
 *     maintenanceMessage: '',
 *   }
 * }
 */

/**
 * Payment Settings
 * {
 *   key: 'payment',
 *   category: 'payment',
 *   value: {
 *     enableCashOnDelivery: true,
 *     enableOnlinePayment: true,
 *     enableWallet: true,
 *     paymentGateways: ['stripe', 'paypal'],
 *     minOrderAmount: 1000,
 *     maxOrderAmount: 1000000,
 *     refundPolicy: 'Within 7 days',
 *   }
 * }
 */

/**
 * Shipping Settings
 * {
 *   key: 'shipping',
 *   category: 'shipping',
 *   value: {
 *     baseDeliveryFee: 500,
 *     freeDeliveryThreshold: 5000,
 *     maxDeliveryDistance: 50, // km
 *     estimatedDeliveryTime: '30-60 minutes',
 *     enableScheduledDelivery: true,
 *   }
 * }
 */

/**
 * Notification Settings
 * {
 *   key: 'notifications',
 *   category: 'notifications',
 *   value: {
 *     enablePushNotifications: true,
 *     enableEmailNotifications: true,
 *     enableSmsNotifications: true,
 *     notifyOnOrderPlaced: true,
 *     notifyOnOrderAccepted: true,
 *     notifyOnOrderDelivered: true,
 *     notifyOnPaymentReceived: true,
 *   }
 * }
 */

/**
 * Security Settings
 * {
 *   key: 'security',
 *   category: 'security',
 *   value: {
 *     enableTwoFactorAuth: false,
 *     sessionTimeout: 3600, // seconds
 *     maxLoginAttempts: 5,
 *     lockoutDuration: 900, // seconds
 *     passwordMinLength: 8,
 *     passwordRequireUppercase: true,
 *     passwordRequireNumbers: true,
 *     passwordRequireSpecialChars: true,
 *   }
 * }
 */

/**
 * Commission Settings
 * {
 *   key: 'commission',
 *   category: 'commission',
 *   value: {
 *     defaultStoreCommission: 10, // percentage
 *     defaultCourierCommission: 20, // percentage
 *     minimumPayout: 10000,
 *     payoutSchedule: 'weekly', // 'daily', 'weekly', 'monthly'
 *   }
 * }
 */

/**
 * Features Settings
 * {
 *   key: 'features',
 *   category: 'features',
 *   value: {
 *     enableReviews: true,
 *     enableLoyaltyPoints: true,
 *     enableCoupons: true,
 *     enableReferrals: true,
 *     enableChat: true,
 *     enableDisputes: true,
 *     enableSubscriptions: false,
 *   }
 * }
 */

