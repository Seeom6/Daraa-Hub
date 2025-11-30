import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AccountDocument = Account & Document;

/**
 * Account Schema
 * Main user account with authentication and role information
 */
@Schema({ timestamps: true })
export class Account {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  phone: string;

  @Prop({ sparse: true })
  email?: string;

  @Prop()
  passwordHash?: string;

  @Prop({
    type: String,
    enum: ['customer', 'store_owner', 'courier', 'admin'],
    default: 'customer',
  })
  role: 'customer' | 'store_owner' | 'courier' | 'admin';

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  // Suspension/Ban fields
  @Prop({ default: false })
  isSuspended: boolean;

  @Prop()
  suspendedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  suspendedBy?: Types.ObjectId;

  @Prop()
  suspensionReason?: string;

  @Prop()
  suspensionExpiresAt?: Date; // null = permanent ban

  @Prop({ type: Types.ObjectId, ref: 'SecurityProfile' })
  securityProfileId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, refPath: 'roleProfileRef' })
  roleProfileId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: [
      'CustomerProfile',
      'StoreOwnerProfile',
      'CourierProfile',
      'AdminProfile',
    ],
  })
  roleProfileRef?:
    | 'CustomerProfile'
    | 'StoreOwnerProfile'
    | 'CourierProfile'
    | 'AdminProfile';

  // Last login tracking
  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastLoginIp?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// Indexes for performance
// Note: phone already has unique: true in @Prop, which creates an index automatically
AccountSchema.index({ email: 1 });
AccountSchema.index({ role: 1 });
AccountSchema.index({ isActive: 1, isVerified: 1 });
AccountSchema.index({ isSuspended: 1 });
AccountSchema.index({ suspensionExpiresAt: 1 });
