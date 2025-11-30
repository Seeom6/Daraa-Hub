import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type DeliveryZoneDocument = DeliveryZone & Document;

/**
 * نوع المنطقة
 */
export enum ZoneType {
  NEIGHBORHOOD = 'neighborhood', // حي
  DISTRICT = 'district', // منطقة
  CITY = 'city', // مدينة
  CUSTOM = 'custom', // منطقة مخصصة
}

/**
 * حالة المنطقة
 */
export enum ZoneStatus {
  ACTIVE = 'active', // نشطة
  INACTIVE = 'inactive', // غير نشطة
  SUSPENDED = 'suspended', // معلقة مؤقتاً
}

/**
 * منطقة التوصيل
 */
@Schema({ timestamps: true })
export class DeliveryZone {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  nameAr: string;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: String })
  descriptionAr?: string;

  @Prop({ type: String, enum: ZoneType, default: ZoneType.NEIGHBORHOOD })
  type: ZoneType;

  @Prop({ type: String, enum: ZoneStatus, default: ZoneStatus.ACTIVE })
  status: ZoneStatus;

  // المنطقة الأب (للتسلسل الهرمي)
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'DeliveryZone' })
  parentZoneId?: Types.ObjectId;

  // رسوم التوصيل
  @Prop({ type: Number, required: true, min: 0 })
  deliveryFee: number;

  @Prop({ type: Number, min: 0 })
  minOrderAmount?: number; // الحد الأدنى للطلب

  @Prop({ type: Number, min: 0 })
  freeDeliveryThreshold?: number; // حد التوصيل المجاني

  // أوقات التوصيل (بالدقائق)
  @Prop({ type: Number, default: 30 })
  estimatedDeliveryTimeMin: number;

  @Prop({ type: Number, default: 60 })
  estimatedDeliveryTimeMax: number;

  // أوقات العمل
  @Prop({
    type: [
      {
        day: { type: Number, min: 0, max: 6 }, // 0 = Sunday
        openTime: String, // "08:00"
        closeTime: String, // "22:00"
        isOpen: { type: Boolean, default: true },
      },
    ],
    default: [],
  })
  workingHours: {
    day: number;
    openTime: string;
    closeTime: string;
    isOpen: boolean;
  }[];

  // الإحداثيات (للخريطة)
  @Prop({
    type: {
      type: String,
      enum: ['Polygon'],
    },
    coordinates: [[[Number]]],
  })
  polygon?: {
    type: 'Polygon';
    coordinates: number[][][];
  };

  // نقطة المركز
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: [Number],
  })
  center?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };

  // الترتيب
  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  // إحصائيات
  @Prop({ type: Number, default: 0 })
  totalOrders: number;

  @Prop({ type: Number, default: 0 })
  activeStores: number;

  @Prop({ type: Number, default: 0 })
  activeCouriers: number;

  // معلومات إضافية
  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account' })
  createdBy?: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Account' })
  updatedBy?: Types.ObjectId;
}

export const DeliveryZoneSchema = SchemaFactory.createForClass(DeliveryZone);

// Indexes
DeliveryZoneSchema.index({ name: 1 }, { unique: true });
DeliveryZoneSchema.index({ status: 1, type: 1 });
DeliveryZoneSchema.index({ parentZoneId: 1 });
DeliveryZoneSchema.index({ polygon: '2dsphere' });
DeliveryZoneSchema.index({ center: '2dsphere' });
DeliveryZoneSchema.index({ sortOrder: 1 });
