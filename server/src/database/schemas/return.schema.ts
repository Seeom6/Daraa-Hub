import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReturnDocument = Return & Document;

export enum ReturnReason {
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NOT_AS_DESCRIBED = 'not_as_described',
  CHANGED_MIND = 'changed_mind',
  OTHER = 'other',
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PICKED_UP = 'picked_up',
  INSPECTED = 'inspected',
  REFUNDED = 'refunded',
  REPLACED = 'replaced',
}

export enum ReturnMethod {
  COURIER_PICKUP = 'courier_pickup',
  DROP_OFF = 'drop_off',
}

export enum RefundMethod {
  ORIGINAL_PAYMENT = 'original_payment',
  POINTS = 'points',
  WALLET = 'wallet',
}

@Schema({ _id: false })
export class ReturnItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ required: true })
  quantity: number;

  @Prop({ type: String, enum: Object.values(ReturnReason), required: true })
  reason: ReturnReason;

  @Prop()
  detailedReason: string;

  @Prop({ type: [String], default: [] })
  images: string[];
}

@Schema({ _id: false })
export class StoreResponse {
  @Prop({ required: true })
  approved: boolean;

  @Prop()
  notes: string;

  @Prop({ type: Date })
  respondedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'StoreOwnerProfile' })
  respondedBy: Types.ObjectId;
}

@Schema({ _id: false })
export class AdminReview {
  @Prop({ required: true })
  approved: boolean;

  @Prop()
  notes: string;

  @Prop({ type: Date })
  reviewedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'AdminProfile' })
  reviewedBy: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Return {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true, index: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CustomerProfile', required: true, index: true })
  customerId: Types.ObjectId;

  @Prop({ type: [ReturnItem], required: true })
  items: ReturnItem[];

  @Prop({ type: String, enum: Object.values(ReturnStatus), default: ReturnStatus.REQUESTED, index: true })
  status: ReturnStatus;

  @Prop({ type: String, enum: Object.values(ReturnMethod), required: true })
  returnMethod: ReturnMethod;

  @Prop({ type: Number, default: 0 })
  refundAmount: number;

  @Prop({ type: String, enum: Object.values(RefundMethod) })
  refundMethod: RefundMethod;

  @Prop({ type: StoreResponse })
  storeResponse: StoreResponse;

  @Prop({ type: AdminReview })
  adminReview: AdminReview;

  @Prop({ type: Date })
  pickupScheduled: Date;

  @Prop({ type: Date })
  pickedUpAt: Date;

  @Prop({ type: Date })
  inspectedAt: Date;

  @Prop({ type: Date })
  refundedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const ReturnSchema = SchemaFactory.createForClass(Return);

// Indexes
ReturnSchema.index({ orderId: 1 });
ReturnSchema.index({ customerId: 1, status: 1 });
ReturnSchema.index({ status: 1 });
ReturnSchema.index({ createdAt: -1 });

