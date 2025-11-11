import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',           // Order created, awaiting confirmation
  CONFIRMED = 'confirmed',       // Store confirmed the order
  PREPARING = 'preparing',       // Store is preparing the order
  READY = 'ready',              // Order ready for pickup
  PICKED_UP = 'picked_up',      // Courier picked up the order
  DELIVERING = 'delivering',     // On the way to customer
  DELIVERED = 'delivered',       // Successfully delivered
  CANCELLED = 'cancelled',       // Order cancelled
}

export enum PaymentMethod {
  CASH = 'cash',                 // Cash on delivery
  CARD = 'card',                 // Credit/Debit card
  POINTS = 'points',             // Loyalty points
  WALLET = 'wallet',             // Digital wallet
  MIXED = 'mixed',               // Combination of methods
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface OrderItem {
  productId: Types.ObjectId;
  variantId?: Types.ObjectId;
  name: string;              // Product name (snapshot)
  image?: string;            // Product image (snapshot)
  sku?: string;
  quantity: number;
  price: number;             // Price at time of order
  pointsPrice?: number;
  subtotal: number;          // quantity * price
}

export interface DeliveryAddress {
  fullName: string;
  phoneNumber: string;
  fullAddress: string;
  city: string;
  district?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  notes?: string;
}

export interface StatusHistory {
  status: OrderStatus;
  timestamp: Date;
  updatedBy?: Types.ObjectId; // Admin, Store, or Courier who updated
  notes?: string;
}

/**
 * Order Schema
 * Customer orders from stores
 */
@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderNumber: string; // Auto-generated (e.g., "ORD-20250109-0001")

  @Prop({ type: Types.ObjectId, ref: 'CustomerProfile', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StoreOwnerProfile', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CourierProfile', index: true })
  courierId?: Types.ObjectId;

  @Prop({
    type: [
      {
        productId: { type: Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: Types.ObjectId, ref: 'ProductVariant' },
        name: { type: String, required: true },
        image: String,
        sku: String,
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        pointsPrice: { type: Number, min: 0 },
        subtotal: { type: Number, required: true, min: 0 },
      },
    ],
    required: true,
  })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal: number; // Sum of items subtotal

  @Prop({ default: 0, min: 0 })
  deliveryFee: number;

  @Prop({ default: 0, min: 0 })
  discount: number; // From coupon/offer

  @Prop({ default: 0, min: 0 })
  tax: number;

  @Prop({ required: true, min: 0 })
  total: number; // subtotal + deliveryFee + tax - discount

  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING, index: true })
  paymentStatus: PaymentStatus;

  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING, index: true })
  orderStatus: OrderStatus;

  @Prop({
    type: {
      fullName: { type: String, required: true },
      phoneNumber: { type: String, required: true },
      fullAddress: { type: String, required: true },
      city: { type: String, required: true },
      district: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true },
      },
      notes: String,
    },
    required: true,
  })
  deliveryAddress: DeliveryAddress;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  appliedCoupon?: Types.ObjectId;

  @Prop()
  customerNotes?: string;

  @Prop()
  storeNotes?: string; // Internal notes from store

  @Prop()
  cancellationReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancelledAt?: Date;

  @Prop({
    type: [
      {
        status: { type: String, enum: OrderStatus, required: true },
        timestamp: { type: Date, default: Date.now },
        updatedBy: { type: Types.ObjectId, ref: 'Account' },
        notes: String,
      },
    ],
    default: [],
  })
  statusHistory: StatusHistory[];

  @Prop()
  estimatedDeliveryTime?: Date;

  @Prop()
  actualDeliveryTime?: Date;

  @Prop({ default: 0, min: 0 })
  pointsEarned: number; // Loyalty points earned from this order

  @Prop({ default: 0, min: 0 })
  pointsUsed: number; // Loyalty points used for this order

  createdAt: Date;
  updatedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ storeId: 1, orderStatus: 1, createdAt: -1 }); // Store orders by status
OrderSchema.index({ courierId: 1, orderStatus: 1, createdAt: -1 }); // Courier orders by status
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ paymentStatus: 1, orderStatus: 1 }); // Payment + order status
OrderSchema.index({ paymentMethod: 1, paymentStatus: 1 }); // Payment method analytics
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ 'deliveryAddress.location': '2dsphere' }); // Geospatial queries

// Pre-save hook to add status to history
OrderSchema.pre('save', function (next) {
  if (this.isModified('orderStatus')) {
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      updatedBy: undefined, // Should be set by the service
      notes: undefined,
    });
  }
  next();
});

