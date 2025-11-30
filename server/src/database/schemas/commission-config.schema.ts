import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type CommissionConfigDocument = CommissionConfig & Document;

/**
 * نوع الكيان المطبق عليه الإعداد
 */
export enum ConfigEntityType {
  GLOBAL = 'global', // إعداد عام
  STORE_CATEGORY = 'store_category', // حسب تصنيف المتجر
  STORE = 'store', // متجر محدد
}

/**
 * إعدادات العمولة
 */
@Schema({ timestamps: true })
export class CommissionConfig {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String })
  nameAr?: string;

  @Prop({ type: String, enum: ConfigEntityType, required: true })
  entityType: ConfigEntityType;

  @Prop({ type: MongooseSchema.Types.ObjectId, refPath: 'entityType' })
  entityId?: Types.ObjectId; // ID المتجر أو التصنيف

  // نسب العمولات
  @Prop({ type: Number, required: true, min: 0, max: 100 })
  platformFeeRate: number; // نسبة عمولة المنصة من المتجر (%)

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  deliveryFeeRate: number; // نسبة عمولة المنصة من التوصيل (%)

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  paymentFeeRate: number; // نسبة عمولة بوابة الدفع (%)

  // حدود العمولة
  @Prop({ type: Number, default: 0 })
  minCommission: number; // الحد الأدنى للعمولة

  @Prop({ type: Number })
  maxCommission?: number; // الحد الأقصى للعمولة

  // الحالة
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  // الأولوية (للتطبيق - الأعلى يطبق أولاً)
  @Prop({ type: Number, default: 0 })
  priority: number;

  // فترة الصلاحية
  @Prop({ type: Date })
  validFrom?: Date;

  @Prop({ type: Date })
  validUntil?: Date;

  // معلومات إضافية
  @Prop({ type: String })
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account' })
  createdBy?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account' })
  updatedBy?: Types.ObjectId;
}

export const CommissionConfigSchema =
  SchemaFactory.createForClass(CommissionConfig);

// Indexes
CommissionConfigSchema.index({ entityType: 1, entityId: 1 });
CommissionConfigSchema.index({ isActive: 1, priority: -1 });
CommissionConfigSchema.index({ validFrom: 1, validUntil: 1 });
