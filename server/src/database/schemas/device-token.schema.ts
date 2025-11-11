import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceTokenDocument = DeviceToken & Document;

/**
 * Device Token Schema
 * Stores device tokens for push notifications (FCM/APNS)
 */
@Schema({ timestamps: true })
export class DeviceToken {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  token: string; // FCM/APNS token

  @Prop({ 
    type: String, 
    enum: ['ios', 'android', 'web'],
    required: true,
  })
  platform: 'ios' | 'android' | 'web';

  @Prop({ type: Object })
  deviceInfo?: {
    deviceId?: string;
    deviceName?: string;
    osVersion?: string;
    appVersion?: string;
    manufacturer?: string;
    model?: string;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastUsedAt?: Date;

  @Prop()
  expiresAt?: Date; // Token expiration (if applicable)

  createdAt: Date;
  updatedAt: Date;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);

// Indexes
DeviceTokenSchema.index({ userId: 1, isActive: 1 });
DeviceTokenSchema.index({ token: 1 }, { unique: true });
DeviceTokenSchema.index({ platform: 1 });
DeviceTokenSchema.index({ lastUsedAt: 1 });

// TTL index - automatically delete inactive tokens older than 90 days
DeviceTokenSchema.index(
  { lastUsedAt: 1 }, 
  { 
    expireAfterSeconds: 7776000, // 90 days
    partialFilterExpression: { isActive: false }
  }
);

