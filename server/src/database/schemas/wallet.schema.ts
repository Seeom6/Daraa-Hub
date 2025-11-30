import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletDocument = Wallet & Document;

/**
 * Wallet Schema
 * محفظة المستخدم - لكل حساب محفظة واحدة
 */
@Schema({ timestamps: true })
export class Wallet {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true })
  accountId: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  balance: number; // الرصيد الحالي بالليرة السورية

  @Prop({ default: 0, min: 0 })
  pendingBalance: number; // رصيد معلق (في انتظار التأكيد)

  @Prop({ default: 0, min: 0 })
  totalDeposited: number; // إجمالي المودع

  @Prop({ default: 0, min: 0 })
  totalWithdrawn: number; // إجمالي المسحوب

  @Prop({ default: 0, min: 0 })
  totalSpent: number; // إجمالي المنفق على الطلبات

  @Prop({ default: 0, min: 0 })
  totalEarned: number; // إجمالي المكتسب (للمتاجر والسائقين)

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isFrozen: boolean; // تجميد المحفظة

  @Prop()
  frozenReason?: string;

  @Prop()
  frozenAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  frozenBy?: Types.ObjectId;

  @Prop({ default: 'SYP' })
  currency: string;

  createdAt: Date;
  updatedAt: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

// Indexes
WalletSchema.index({ accountId: 1 }, { unique: true });
WalletSchema.index({ isActive: 1, isFrozen: 1 }); // Compound index for active/frozen queries
WalletSchema.index({ balance: 1, isActive: 1 }); // For balance-based queries
WalletSchema.index({ isFrozen: 1, frozenAt: -1 }); // For frozen wallet queries
WalletSchema.index({ currency: 1, isActive: 1 }); // For currency-based queries
