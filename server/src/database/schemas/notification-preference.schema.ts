import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationPreferenceDocument = NotificationPreference & Document;

/**
 * Notification Preference Schema
 * User preferences for notification channels and categories
 */
@Schema({ timestamps: true })
export class NotificationPreference {
  @Prop({
    type: Types.ObjectId,
    ref: 'Account',
    required: true,
    unique: true,
  })
  userId: Types.ObjectId;

  // Channel preferences
  @Prop({
    type: Object,
    default: {
      push: true,
      email: true,
      sms: true,
      in_app: true,
    },
  })
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    in_app: boolean;
  };

  // Category preferences
  @Prop({
    type: Object,
    default: {
      orders: true,
      payments: true,
      delivery: true,
      verification: true,
      account: true,
      promotions: true,
      system: true,
      security: true,
      reviews: true,
      disputes: true,
    },
  })
  categories: {
    orders: boolean;
    payments: boolean;
    delivery: boolean;
    verification: boolean;
    account: boolean;
    promotions: boolean;
    system: boolean;
    security: boolean;
    reviews: boolean;
    disputes: boolean;
  };

  // Quiet hours (do not disturb)
  @Prop({ type: Object })
  quietHours?: {
    enabled: boolean;
    startTime: string; // e.g., "22:00"
    endTime: string; // e.g., "08:00"
    timezone: string; // e.g., "Asia/Damascus"
  };

  // Language preference
  @Prop({
    type: String,
    enum: ['ar', 'en'],
    default: 'ar',
  })
  language: 'ar' | 'en';

  // Email digest preference
  @Prop({
    type: String,
    enum: ['instant', 'daily', 'weekly', 'never'],
    default: 'instant',
  })
  emailDigest: 'instant' | 'daily' | 'weekly' | 'never';

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(
  NotificationPreference,
);

// Note: userId already has unique: true in @Prop, which creates an index automatically
