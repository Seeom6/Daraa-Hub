import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

/**
 * Notification Schema
 * Stores all notifications sent to users
 */
@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  recipientId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['customer', 'store_owner', 'courier', 'admin'],
    required: true,
  })
  recipientRole: 'customer' | 'store_owner' | 'courier' | 'admin';

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: [
      'order',
      'payment',
      'delivery',
      'verification',
      'account',
      'promotion',
      'system',
      'security',
      'review',
      'dispute',
    ],
    required: true,
  })
  type:
    | 'order'
    | 'payment'
    | 'delivery'
    | 'verification'
    | 'account'
    | 'promotion'
    | 'system'
    | 'security'
    | 'review'
    | 'dispute';

  @Prop({
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  })
  priority: 'info' | 'success' | 'warning' | 'error';

  @Prop({ type: Object })
  data?: Record<string, any>; // Additional data for the notification

  @Prop({ type: Types.ObjectId, refPath: 'relatedModel' })
  relatedId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: [
      'Order',
      'Payment',
      'Product',
      'Review',
      'Dispute',
      'VerificationRequest',
    ],
  })
  relatedModel?: string;

  @Prop({
    type: [String],
    enum: ['push', 'email', 'sms', 'in_app'],
    default: ['in_app'],
  })
  channels: ('push' | 'email' | 'sms' | 'in_app')[];

  @Prop({
    type: Object,
    default: {
      push: 'pending',
      email: 'pending',
      sms: 'pending',
      in_app: 'pending',
    },
  })
  deliveryStatus: {
    push?: 'pending' | 'sent' | 'failed';
    email?: 'pending' | 'sent' | 'failed';
    sms?: 'pending' | 'sent' | 'failed';
    in_app?: 'pending' | 'sent' | 'failed';
  };

  @Prop({ default: false })
  isRead: boolean;

  @Prop()
  readAt?: Date;

  @Prop()
  sentAt?: Date;

  @Prop()
  expiresAt?: Date; // For time-sensitive notifications

  @Prop()
  actionUrl?: string; // Deep link or URL to navigate to

  @Prop()
  imageUrl?: string; // Optional image for rich notifications

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes
NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });
NotificationSchema.index({ relatedId: 1 });
NotificationSchema.index({ expiresAt: 1 });

// TTL index - automatically delete read notifications older than 90 days
NotificationSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 7776000, // 90 days
    partialFilterExpression: { isRead: true },
  },
);
