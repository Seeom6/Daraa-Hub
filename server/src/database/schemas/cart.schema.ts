import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

export interface CartItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  storeId: Types.ObjectId; // Store that owns the product
  quantity: number;
  price: number; // Price at time of adding
  pointsPrice?: number; // Points price at time of adding
  selectedOptions?: Record<string, any>; // Any custom options
  addedAt: Date;
}

/**
 * Cart Schema
 * Shopping cart for customers
 */
@Schema({ timestamps: true })
export class Cart {
  @Prop({ type: Types.ObjectId, ref: 'CustomerProfile', index: true })
  customerId?: Types.ObjectId;

  @Prop({ index: true, sparse: true })
  sessionId?: string; // For guest carts

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: Types.ObjectId, ref: 'ProductVariant' },
        storeId: { type: Types.ObjectId, ref: 'StoreOwnerProfile', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        pointsPrice: { type: Number, min: 0 },
        selectedOptions: { type: Object },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    default: [],
  })
  items: CartItem[];

  @Prop({ default: 0, min: 0 })
  subtotal: number; // Calculated from items

  @Prop({ default: 0, min: 0 })
  discount: number; // From coupon

  @Prop({ default: 0, min: 0 })
  total: number; // subtotal - discount

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  appliedCoupon?: Types.ObjectId;

  @Prop({ index: true })
  expiresAt?: Date; // Cart expiration (e.g., 7 days for guest carts)

  createdAt: Date;
  updatedAt: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Indexes
CartSchema.index({ customerId: 1 }, { unique: true, sparse: true });
CartSchema.index({ sessionId: 1 }, { unique: true, sparse: true });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Pre-save hook to calculate totals
CartSchema.pre('save', function (next) {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // Calculate total
  this.total = this.subtotal - this.discount;
  
  next();
});

