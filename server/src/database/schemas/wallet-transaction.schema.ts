import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

export enum TransactionType {
  DEPOSIT = 'deposit', // إيداع
  WITHDRAWAL = 'withdrawal', // سحب
  PAYMENT = 'payment', // دفع طلب
  REFUND = 'refund', // استرداد
  TRANSFER_IN = 'transfer_in', // تحويل وارد
  TRANSFER_OUT = 'transfer_out', // تحويل صادر
  COMMISSION = 'commission', // عمولة (للمنصة)
  EARNING = 'earning', // أرباح (للمتجر/السائق)
  BONUS = 'bonus', // مكافأة
  ADJUSTMENT = 'adjustment', // تعديل يدوي من الإدارة
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REVERSED = 'reversed',
}

/**
 * Wallet Transaction Schema
 * سجل معاملات المحفظة
 */
@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: true })
  walletId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  accountId: Types.ObjectId;

  @Prop({ type: String, enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ required: true })
  amount: number; // المبلغ (موجب دائماً)

  @Prop({ required: true })
  balanceBefore: number; // الرصيد قبل العملية

  @Prop({ required: true })
  balanceAfter: number; // الرصيد بعد العملية

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Prop({ required: true })
  description: string; // وصف العملية

  @Prop()
  descriptionAr?: string; // الوصف بالعربية

  // المرجع للعملية الأصلية
  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId;

  // للتحويلات
  @Prop({ type: Types.ObjectId, ref: 'Account' })
  relatedAccountId?: Types.ObjectId; // الطرف الآخر في التحويل

  @Prop({ type: Types.ObjectId, ref: 'WalletTransaction' })
  relatedTransactionId?: Types.ObjectId; // العملية المرتبطة

  // معلومات إضافية
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  // من قام بالعملية
  @Prop({ type: Types.ObjectId, ref: 'Account' })
  performedBy?: Types.ObjectId; // للعمليات اليدوية

  @Prop()
  ipAddress?: string;

  @Prop({ unique: true, sparse: true })
  transactionRef?: string; // رقم مرجعي فريد

  createdAt: Date;
  updatedAt: Date;
}

export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);

// Indexes
WalletTransactionSchema.index({ walletId: 1, createdAt: -1 });
WalletTransactionSchema.index({ accountId: 1, createdAt: -1 });
WalletTransactionSchema.index({ type: 1, status: 1 });
WalletTransactionSchema.index({ orderId: 1 });
WalletTransactionSchema.index(
  { transactionRef: 1 },
  { unique: true, sparse: true },
);
WalletTransactionSchema.index({ createdAt: -1 });
