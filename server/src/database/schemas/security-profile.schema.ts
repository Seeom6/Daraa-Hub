import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SecurityProfileDocument = SecurityProfile & Document;

/**
 * Login History Entry
 */
export class LoginHistoryEntry {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  device: string;

  @Prop({ required: true, type: Date })
  timestamp: Date;

  @Prop({ required: true })
  success: boolean;
}

/**
 * Security Profile Schema
 * Manages security-related information for accounts
 */
@Schema({ timestamps: true })
export class SecurityProfile {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true, index: true })
  accountId: Types.ObjectId;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop({ default: false })
  idVerified: boolean;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop()
  lastOtpCode?: string;

  @Prop({ type: Date })
  lastOtpSentAt?: Date;

  @Prop({ type: Number, default: 0 })
  failedAttempts: number;

  @Prop({ type: Date })
  lockedUntil?: Date;

  @Prop({ 
    type: [{ 
      ip: String, 
      device: String, 
      timestamp: Date, 
      success: Boolean 
    }], 
    default: [] 
  })
  loginHistory: LoginHistoryEntry[];

  createdAt: Date;
  updatedAt: Date;
}

export const SecurityProfileSchema = SchemaFactory.createForClass(SecurityProfile);

// Indexes
SecurityProfileSchema.index({ accountId: 1 });
SecurityProfileSchema.index({ phoneVerified: 1 });

