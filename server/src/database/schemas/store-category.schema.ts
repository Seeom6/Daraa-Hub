import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Store Category Schema
 * تصنيفات المتاجر (مطاعم، ملابس، سوبر ماركت، إلخ)
 */
@Schema({ timestamps: true, collection: 'storecategories' })
export class StoreCategory {
  @Prop({ required: true, trim: true })
  name: string; // اسم التصنيف بالعربية (مثال: "مطاعم وأطعمة")

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  slug: string; // معرف فريد (مثال: "restaurants-food")

  @Prop({ trim: true })
  description?: string; // وصف التصنيف

  @Prop({ trim: true })
  icon?: string; // أيقونة التصنيف (emoji أو URL)

  @Prop({ trim: true })
  image?: string; // صورة التصنيف

  @Prop({
    type: Types.ObjectId,
    ref: 'StoreCategory',
    default: null,
  })
  parentCategory?: Types.ObjectId; // التصنيف الأب (للتصنيفات الفرعية)

  @Prop({ default: 0, min: 0 })
  level: number; // 0 = تصنيف رئيسي, 1 = تصنيف فرعي, إلخ

  @Prop({ default: 0 })
  order: number; // ترتيب العرض

  @Prop({ default: true })
  isActive: boolean; // هل التصنيف نشط؟

  @Prop({ default: false })
  isDeleted: boolean; // هل التصنيف محذوف؟ (soft delete)

  @Prop()
  deletedAt?: Date; // تاريخ الحذف

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  deletedBy?: Types.ObjectId; // من قام بالحذف

  @Prop({ default: 0, min: 0 })
  storeCount: number; // عدد المتاجر في هذا التصنيف (denormalized)

  @Prop({ default: 0, min: 0 })
  totalProducts: number; // إجمالي المنتجات في هذا التصنيف

  @Prop({ default: 0, min: 0 })
  totalOrders: number; // إجمالي الطلبات من هذا التصنيف

  @Prop({ default: 0, min: 0, max: 5 })
  averageRating: number; // متوسط تقييم المتاجر في هذا التصنيف

  @Prop({ default: 0, min: 0 })
  popularityScore: number; // نقاط الشعبية (محسوبة من المبيعات والتقييمات)

  @Prop({ trim: true })
  seoTitle?: string; // عنوان SEO

  @Prop({ trim: true })
  seoDescription?: string; // وصف SEO

  @Prop({ type: [String], default: [] })
  seoKeywords?: string[]; // كلمات مفتاحية SEO

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>; // بيانات إضافية مرنة

  createdAt: Date;
  updatedAt: Date;
}

export const StoreCategorySchema = SchemaFactory.createForClass(StoreCategory);

// Indexes
// Note: slug already has unique: true in @Prop, which creates an index automatically
StoreCategorySchema.index({ parentCategory: 1 });
StoreCategorySchema.index({ isActive: 1, order: 1 });
StoreCategorySchema.index({ level: 1 });
StoreCategorySchema.index({ name: 'text', description: 'text' });

// Virtual for subcategories
StoreCategorySchema.virtual('subcategories', {
  ref: 'StoreCategory',
  localField: '_id',
  foreignField: 'parentCategory',
});

// Virtual for stores
StoreCategorySchema.virtual('stores', {
  ref: 'StoreOwnerProfile',
  localField: '_id',
  foreignField: 'storeCategories',
});

// Export Document type
export type StoreCategoryDocument = StoreCategory & Document;
