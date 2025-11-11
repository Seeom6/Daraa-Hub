import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

export enum ReviewTargetType {
  PRODUCT = 'product',
  STORE = 'store',
  COURIER = 'courier',
}

export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface StoreResponse {
  message: string;
  respondedAt: Date;
  respondedBy: Types.ObjectId;
}

/**
 * Review Schema
 * Supports reviews for products, stores, and couriers
 */
@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'CustomerProfile', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: ReviewTargetType,
    required: true,
    index: true,
  })
  targetType: ReviewTargetType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  targetId: Types.ObjectId; // Product/Store/Courier ID

  @Prop({ type: Types.ObjectId, ref: 'Order', index: true })
  orderId?: Types.ObjectId; // For verification of purchase

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ trim: true })
  title?: string;

  @Prop({ trim: true })
  comment?: string;

  @Prop({ type: [String], default: [] })
  images: string[]; // Review images

  @Prop({ default: false })
  isVerifiedPurchase: boolean;

  @Prop({ default: 0, min: 0 })
  helpfulCount: number;

  @Prop({ default: 0, min: 0 })
  notHelpfulCount: number;

  @Prop({
    type: String,
    enum: ReviewStatus,
    default: ReviewStatus.APPROVED, // Auto-approve by default
    index: true,
  })
  status: ReviewStatus;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  moderatedBy?: Types.ObjectId;

  @Prop()
  moderationNotes?: string;

  @Prop({ type: Object })
  storeResponse?: StoreResponse;

  @Prop({ default: false })
  isEdited: boolean;

  @Prop()
  editedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes
ReviewSchema.index({ customerId: 1, targetType: 1, targetId: 1 }); // Customer's reviews
ReviewSchema.index({ targetType: 1, targetId: 1, status: 1, createdAt: -1 }); // Target's reviews
ReviewSchema.index({ orderId: 1 }); // Order reviews
ReviewSchema.index({ status: 1, createdAt: -1 }); // Moderation queue
ReviewSchema.index({ rating: 1 }); // Filter by rating
ReviewSchema.index({ isVerifiedPurchase: 1 }); // Verified purchases

// Compound index for preventing duplicate reviews
ReviewSchema.index({ customerId: 1, targetType: 1, targetId: 1, orderId: 1 }, { unique: true, sparse: true });

