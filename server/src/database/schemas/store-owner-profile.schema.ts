import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreOwnerProfileDocument = StoreOwnerProfile & Document;

/**
 * Store Owner Profile Schema
 * Profile for merchants/store owners
 */
@Schema({ timestamps: true })
export class StoreOwnerProfile {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true, index: true })
  accountId: Types.ObjectId;

  @Prop({ trim: true })
  storeName?: string;

  @Prop()
  storeDescription?: string;

  @Prop()
  storeLogo?: string;

  @Prop()
  storeBanner?: string;

  @Prop({ type: [String], default: [] })
  storeCategories: string[];

  @Prop({ 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'suspended'], 
    default: 'pending' 
  })
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';

  @Prop()
  businessLicense?: string;

  @Prop()
  taxId?: string;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalReviews: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalSales: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalRevenue: number;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  products: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Order', default: [] })
  orders: Types.ObjectId[];

  @Prop({ default: true })
  isStoreActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const StoreOwnerProfileSchema = SchemaFactory.createForClass(StoreOwnerProfile);

// Indexes
StoreOwnerProfileSchema.index({ accountId: 1 });
StoreOwnerProfileSchema.index({ verificationStatus: 1 });
StoreOwnerProfileSchema.index({ rating: -1 });
StoreOwnerProfileSchema.index({ isStoreActive: 1 });

