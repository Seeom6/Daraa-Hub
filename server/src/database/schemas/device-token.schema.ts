import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DeviceTokenDocument = DeviceToken & Document;

/**
 * Device Token Schema
 * Stores device tokens for push notifications (FCM/APNS)
 */
@Schema({ timestamps: true })
export class DeviceToken {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
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
// Note: token already has unique: true in @Prop, which creates an index automatically
DeviceTokenSchema.index({ platform: 1 });

// TTL index - automatically delete inactive tokens older than 90 days
// This also serves as the index for lastUsedAt queries
DeviceTokenSchema.index(
  { lastUsedAt: 1 },
  {
    expireAfterSeconds: 7776000, // 90 days
    partialFilterExpression: { isActive: false },
  },
);
