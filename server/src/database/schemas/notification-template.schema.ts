import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationTemplateDocument = NotificationTemplate & Document;

/**
 * Notification Template Schema
 * Reusable templates for notifications
 */
@Schema({ timestamps: true })
export class NotificationTemplate {
  @Prop({ required: true, unique: true, index: true })
  code: string; // e.g., 'order_placed', 'store_approved', 'user_suspended'

  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ 
    type: String, 
    enum: [
      'order', 'payment', 'delivery', 'verification', 'account', 
      'promotion', 'system', 'security', 'review', 'dispute'
    ],
    required: true,
  })
  type: 'order' | 'payment' | 'delivery' | 'verification' | 'account' | 
        'promotion' | 'system' | 'security' | 'review' | 'dispute';

  @Prop({ 
    type: [String],
    enum: ['customer', 'store_owner', 'courier', 'admin'],
    default: ['customer'],
  })
  targetRoles: ('customer' | 'store_owner' | 'courier' | 'admin')[];

  // In-App Notification Template
  @Prop({ type: Object })
  inApp?: {
    titleAr: string;
    titleEn?: string;
    messageAr: string;
    messageEn?: string;
    variables?: string[]; // e.g., ['orderNumber', 'storeName']
  };

  // Email Template
  @Prop({ type: Object })
  email?: {
    subjectAr: string;
    subjectEn?: string;
    bodyAr: string; // HTML template
    bodyEn?: string; // HTML template
    variables?: string[];
  };

  // SMS Template
  @Prop({ type: Object })
  sms?: {
    messageAr: string;
    messageEn?: string;
    variables?: string[];
  };

  // Push Notification Template
  @Prop({ type: Object })
  push?: {
    titleAr: string;
    titleEn?: string;
    bodyAr: string;
    bodyEn?: string;
    variables?: string[];
  };

  @Prop({ 
    type: [String],
    enum: ['push', 'email', 'sms', 'in_app'],
    default: ['in_app'],
  })
  defaultChannels: ('push' | 'email' | 'sms' | 'in_app')[];

  @Prop({ 
    type: String, 
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info',
  })
  priority: 'info' | 'success' | 'warning' | 'error';

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  lastModifiedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const NotificationTemplateSchema = SchemaFactory.createForClass(NotificationTemplate);

// Indexes
NotificationTemplateSchema.index({ code: 1 });
NotificationTemplateSchema.index({ type: 1 });
NotificationTemplateSchema.index({ isActive: 1 });

