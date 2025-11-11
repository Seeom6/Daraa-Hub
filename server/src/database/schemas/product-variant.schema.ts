import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductVariantDocument = ProductVariant & Document;

@Schema({ timestamps: true })
export class ProductVariant {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true, index: true })
  productId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string; // e.g., "Red - Large"

  @Prop({ unique: true, sparse: true, trim: true })
  sku?: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ min: 0 })
  compareAtPrice?: number;

  @Prop({ min: 0 })
  pointsPrice?: number;

  @Prop({ type: Map, of: String, default: {} })
  attributes: Map<string, string>; // e.g., { size: 'Large', color: 'Red', material: 'Cotton' }

  @Prop({ trim: true })
  image?: string;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ default: true, index: true })
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

// Indexes
ProductVariantSchema.index({ productId: 1 });
ProductVariantSchema.index({ sku: 1 }, { unique: true, sparse: true });
ProductVariantSchema.index({ isActive: 1 });

