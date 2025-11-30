import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CommissionDocument = Commission & Document;

/**
 * نوع العمولة
 */
export enum CommissionType {
  PLATFORM_FEE = 'platform_fee', // عمولة المنصة من المتجر
  DELIVERY_FEE = 'delivery_fee', // عمولة التوصيل
  PAYMENT_FEE = 'payment_fee', // عمولة بوابة الدفع
  REFERRAL_BONUS = 'referral_bonus', // مكافأة الإحالة
}

/**
 * حالة العمولة
 */
export enum CommissionStatus {
  PENDING = 'pending', // معلقة
  COLLECTED = 'collected', // تم تحصيلها
  PAID_OUT = 'paid_out', // تم صرفها
  CANCELLED = 'cancelled', // ملغاة
  REFUNDED = 'refunded', // مستردة
}

/**
 * العمولة
 */
@Schema({ timestamps: true })
export class Commission {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true,
  })
  orderId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true,
  })
  storeAccountId: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account', index: true })
  courierAccountId?: Types.ObjectId;

  @Prop({ type: String, enum: CommissionType, required: true })
  type: CommissionType;

  @Prop({
    type: String,
    enum: CommissionStatus,
    default: CommissionStatus.PENDING,
  })
  status: CommissionStatus;

  // المبالغ
  @Prop({ type: Number, required: true })
  orderAmount: number;

  @Prop({ type: Number, required: true })
  commissionRate: number; // النسبة المئوية

  @Prop({ type: Number, required: true })
  commissionAmount: number; // المبلغ المحسوب

  @Prop({ type: Number, default: 0 })
  deliveryFee: number;

  @Prop({ type: Number, default: 0 })
  platformDeliveryCommission: number; // عمولة المنصة من التوصيل

  // الأرباح الصافية
  @Prop({ type: Number, required: true })
  storeNetEarnings: number; // صافي أرباح المتجر

  @Prop({ type: Number, default: 0 })
  courierNetEarnings: number; // صافي أرباح السائق

  @Prop({ type: Number, default: 0 })
  platformNetEarnings: number; // صافي أرباح المنصة

  // تواريخ
  @Prop({ type: Date })
  collectedAt?: Date;

  @Prop({ type: Date })
  paidOutAt?: Date;

  // معلومات إضافية
  @Prop({ type: String })
  notes?: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;
}

export const CommissionSchema = SchemaFactory.createForClass(Commission);

// Indexes
CommissionSchema.index({ orderId: 1 }, { unique: true });
CommissionSchema.index({ storeAccountId: 1, status: 1 });
CommissionSchema.index({ courierAccountId: 1, status: 1 });
CommissionSchema.index({ type: 1, status: 1 });
CommissionSchema.index({ createdAt: -1 });
