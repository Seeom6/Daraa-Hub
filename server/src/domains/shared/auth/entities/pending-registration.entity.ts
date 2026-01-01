import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PendingRegistrationDocument = PendingRegistration & Document;

/**
 * Temporary storage for registration data before account creation
 * This entity stores user data during the registration flow
 * and is deleted after successful account creation
 */
@Schema({ timestamps: true })
export class PendingRegistration {
  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ default: false })
  otpVerified: boolean;

  @Prop()
  email?: string;

  @Prop()
  countryCode?: string;

  @Prop({ type: Date, default: () => new Date(Date.now() + 30 * 60 * 1000) }) // 30 minutes expiry
  expiresAt: Date;
}

export const PendingRegistrationSchema = SchemaFactory.createForClass(
  PendingRegistration,
);

// Index for automatic deletion of expired records
PendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

