import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerProfileDocument = CustomerProfile & Document;

/**
 * Customer Profile Schema
 * Default profile created for all new users
 */
@Schema({ timestamps: true })
export class CustomerProfile {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true, index: true })
  accountId: Types.ObjectId;

  @Prop({ type: Number, default: 0, min: 0 })
  loyaltyPoints: number;

  @Prop({ 
    type: String, 
    enum: ['bronze', 'silver', 'gold', 'platinum'], 
    default: 'bronze' 
  })
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';

  @Prop({ type: [Types.ObjectId], ref: 'Address', default: [] })
  addresses: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Order', default: [] })
  orders: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Wishlist', default: [] })
  wishlist: Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);

// Indexes
CustomerProfileSchema.index({ accountId: 1 });
CustomerProfileSchema.index({ tier: 1 });
CustomerProfileSchema.index({ loyaltyPoints: -1 });

