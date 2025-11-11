import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: true })
export class Category {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  slug: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  icon?: string; // Icon name or URL

  @Prop({ trim: true })
  image?: string; // Category image URL

  @Prop({ type: Types.ObjectId, ref: 'Category', default: null })
  parentCategory?: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  level: number; // 0 for root, 1 for subcategory, etc.

  @Prop({ default: 0 })
  order: number; // Display order

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ trim: true })
  seoTitle?: string;

  @Prop({ trim: true })
  seoDescription?: string;

  @Prop({ type: [String], default: [] })
  seoKeywords?: string[];

  @Prop({ default: 0, min: 0 })
  productCount: number; // Denormalized count

  createdAt: Date;
  updatedAt: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Indexes
CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parentCategory: 1 });
CategorySchema.index({ isActive: 1, order: 1 });
CategorySchema.index({ level: 1 });
CategorySchema.index({ name: 'text', description: 'text' });

// Virtual for subcategories
CategorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

// Ensure virtuals are included in JSON
CategorySchema.set('toJSON', { virtuals: true });
CategorySchema.set('toObject', { virtuals: true });

