import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type StoreDeliveryZoneDocument = StoreDeliveryZone & Document;

/**
 * ربط المتجر بمناطق التوصيل
 * (يتيح للمتجر تحديد مناطق التغطية ورسوم خاصة)
 */
@Schema({ timestamps: true })
export class StoreDeliveryZone {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Account',
    required: true,
    index: true,
  })
  storeAccountId: Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'DeliveryZone',
    required: true,
    index: true,
  })
  zoneId: Types.ObjectId;

  // تجاوز رسوم التوصيل (اختياري)
  @Prop({ type: Number, min: 0 })
  customDeliveryFee?: number;

  // تجاوز الحد الأدنى للطلب (اختياري)
  @Prop({ type: Number, min: 0 })
  customMinOrderAmount?: number;

  // تجاوز حد التوصيل المجاني (اختياري)
  @Prop({ type: Number, min: 0 })
  customFreeDeliveryThreshold?: number;

  // تجاوز وقت التوصيل (اختياري)
  @Prop({ type: Number, min: 0 })
  customDeliveryTimeMin?: number;

  @Prop({ type: Number, min: 0 })
  customDeliveryTimeMax?: number;

  // الحالة
  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  // الأولوية (للمتاجر التي تغطي نفس المنطقة)
  @Prop({ type: Number, default: 0 })
  priority: number;
}

export const StoreDeliveryZoneSchema =
  SchemaFactory.createForClass(StoreDeliveryZone);

// Unique compound index
StoreDeliveryZoneSchema.index(
  { storeAccountId: 1, zoneId: 1 },
  { unique: true },
);
StoreDeliveryZoneSchema.index({ zoneId: 1, isActive: 1 });
