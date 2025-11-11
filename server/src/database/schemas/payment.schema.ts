import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentMethodType {
  CASH = 'cash',
  CARD = 'card',
  POINTS = 'points',
  WALLET = 'wallet',
  MIXED = 'mixed',
}

export enum PaymentStatusType {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export interface PaymentBreakdown {
  cash?: number;
  card?: number;
  points?: number;
  wallet?: number;
}

export interface RefundInfo {
  amount: number;
  reason: string;
  refundedAt: Date;
  refundedBy?: Types.ObjectId; // Admin who processed refund
  transactionId?: string;
}

/**
 * Payment Schema
 * Payment records for orders
 */
@Schema({ timestamps: true })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CustomerProfile', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'StoreOwnerProfile', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number; // Total payment amount

  @Prop({ type: String, enum: PaymentMethodType, required: true })
  paymentMethod: PaymentMethodType;

  @Prop({
    type: {
      cash: { type: Number, min: 0 },
      card: { type: Number, min: 0 },
      points: { type: Number, min: 0 },
      wallet: { type: Number, min: 0 },
    },
  })
  paymentBreakdown?: PaymentBreakdown; // For mixed payments

  @Prop({ type: String, enum: PaymentStatusType, default: PaymentStatusType.PENDING, index: true })
  status: PaymentStatusType;

  @Prop()
  transactionId?: string; // Payment gateway transaction ID

  @Prop({ type: Object })
  gatewayResponse?: Record<string, any>; // Raw response from payment gateway

  @Prop()
  paidAt?: Date;

  @Prop()
  failureReason?: string;

  @Prop()
  failedAt?: Date;

  @Prop({
    type: [
      {
        amount: { type: Number, required: true, min: 0 },
        reason: { type: String, required: true },
        refundedAt: { type: Date, default: Date.now },
        refundedBy: { type: Types.ObjectId, ref: 'Account' },
        transactionId: String,
      },
    ],
    default: [],
  })
  refunds: RefundInfo[];

  @Prop({ default: 0, min: 0 })
  totalRefunded: number;

  @Prop()
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// Indexes
PaymentSchema.index({ orderId: 1 }, { unique: true });
PaymentSchema.index({ customerId: 1, createdAt: -1 });
PaymentSchema.index({ storeId: 1, status: 1, createdAt: -1 }); // Store payments by status
PaymentSchema.index({ status: 1, createdAt: -1 }); // All payments by status
PaymentSchema.index({ paymentMethod: 1, status: 1 }); // Payment method analytics
PaymentSchema.index({ transactionId: 1 }, { sparse: true });
PaymentSchema.index({ createdAt: -1 });

