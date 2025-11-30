import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PointsTransactionDocument = PointsTransaction & Document;

export enum TransactionType {
  EARNED = 'earned',
  SPENT = 'spent',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
}

@Schema({ timestamps: true })
export class PointsTransaction {
  @Prop({
    type: Types.ObjectId,
    ref: 'CustomerProfile',
    required: true,
  })
  customerId: Types.ObjectId;

  @Prop({ type: String, enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ required: true })
  amount: number; // Positive for earned, negative for spent

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ required: true, default: 0 })
  balanceBefore: number;

  @Prop({ required: true, default: 0 })
  balanceAfter: number;

  @Prop()
  expiresAt?: Date; // Points expiration date

  @Prop({ default: false })
  isExpired: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const PointsTransactionSchema =
  SchemaFactory.createForClass(PointsTransaction);

// Indexes
PointsTransactionSchema.index({ customerId: 1, createdAt: -1 });
PointsTransactionSchema.index({ orderId: 1 });
PointsTransactionSchema.index({ expiresAt: 1, isExpired: 1 });
