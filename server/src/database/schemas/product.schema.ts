import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum ProductUnit {
  PIECE = 'piece', // قطعة
  KG = 'kg', // كيلوغرام
  GRAM = 'gram', // غرام
  METER = 'meter', // متر
  LITER = 'liter', // لتر
  BOX = 'box', // صندوق
  PACK = 'pack', // علبة
}

@Schema({ timestamps: true })
export class Product {
  @Prop({
    type: Types.ObjectId,
    ref: 'StoreOwnerProfile',
    required: true,
  })
  storeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  shortDescription?: string;

  @Prop({ unique: true, sparse: true, trim: true })
  sku?: string;

  @Prop({ trim: true })
  barcode?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  compareAtPrice?: number; // Original price for discounts

  @Prop({ min: 0 })
  pointsPrice?: number; // Price in loyalty points

  @Prop({ min: 0 })
  costPrice?: number; // For profit calculation

  @Prop({ type: String, enum: ProductUnit, default: ProductUnit.PIECE })
  unit: ProductUnit; // Unit of measurement

  @Prop({ default: 1, min: 0 })
  unitValue: number; // e.g., 1 kg, 500 gram, 2 meters

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ trim: true })
  mainImage?: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: Map, of: String, default: {} })
  specifications: Map<string, string>; // Flexible product specs

  @Prop({ default: false })
  hasVariants: boolean;

  @Prop({
    type: String,
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ default: 0, min: 0 })
  reviewCount: number;

  @Prop({ default: 0, min: 0 })
  soldCount: number;

  @Prop({ default: 0, min: 0 })
  viewCount: number;

  @Prop({ trim: true })
  seoTitle?: string;

  @Prop({ trim: true })
  seoDescription?: string;

  @Prop({ type: [String], default: [] })
  seoKeywords?: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Indexes
ProductSchema.index({ storeId: 1, status: 1 });
ProductSchema.index({ categoryId: 1, status: 1 });
// Note: slug and sku already have unique: true in @Prop, which creates indexes automatically
ProductSchema.index({ status: 1, isFeatured: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ soldCount: -1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for inventory
ProductSchema.virtual('inventory', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'productId',
  justOne: true,
});

// Virtual for variants
ProductSchema.virtual('variants', {
  ref: 'ProductVariant',
  localField: '_id',
  foreignField: 'productId',
});

// Ensure virtuals are included in JSON
ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });
