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

  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @Prop({ sparse: true, index: true })
  email?: string;

  @Prop()
  passwordHash?: string;

  @Prop({ 
    type: String, 
    enum: ['customer', 'store_owner', 'courier', 'admin'], 
    default: 'customer' 
  })
  role: 'customer' | 'store_owner' | 'courier' | 'admin';

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: Types.ObjectId, ref: 'SecurityProfile' })
  securityProfileId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, refPath: 'roleProfileRef' })
  roleProfileId?: Types.ObjectId;

  @Prop({ 
    type: String,
    enum: ['CustomerProfile', 'StoreOwnerProfile', 'CourierProfile', 'AdminProfile']
  })
  roleProfileRef?: 'CustomerProfile' | 'StoreOwnerProfile' | 'CourierProfile' | 'AdminProfile';

  createdAt: Date;
  updatedAt: Date;
}

export const AccountSchema = SchemaFactory.createForClass(Account);

// Indexes for performance
AccountSchema.index({ phone: 1 });
AccountSchema.index({ email: 1 });
AccountSchema.index({ role: 1 });
AccountSchema.index({ isActive: 1, isVerified: 1 });

