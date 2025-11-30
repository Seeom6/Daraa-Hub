import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DisputeDocument = Dispute & Document;

export enum DisputeType {
  WRONG_ITEM = 'wrong_item',
  DAMAGED_ITEM = 'damaged_item',
  LATE_DELIVERY = 'late_delivery',
  MISSING_ITEM = 'missing_item',
  PAYMENT_ISSUE = 'payment_issue',
  OTHER = 'other',
}

export enum DisputePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum DisputeStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated',
}

export enum DisputeResolutionAction {
  REFUND = 'refund',
  REPLACEMENT = 'replacement',
  COMPENSATION = 'compensation',
  WARNING = 'warning',
  NO_ACTION = 'no_action',
}

@Schema({ _id: false })
export class DisputeEvidence {
  @Prop({ required: true })
  type: string;

  @Prop({ required: true })
  url: string;
}

@Schema({ _id: false })
export class DisputeMessage {
  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ default: false })
  isAdminMessage: boolean;
}

@Schema({ _id: false })
export class DisputeResolution {
  @Prop({ type: String, enum: Object.values(DisputeResolutionAction) })
  action: DisputeResolutionAction;

  @Prop({ type: Number, default: 0 })
  amount: number;

  @Prop()
  notes: string;
}

@Schema({ timestamps: true })
export class Dispute {
  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  reportedBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  reportedAgainst: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(DisputeType), required: true })
  type: DisputeType;

  @Prop({
    type: String,
    enum: Object.values(DisputePriority),
    default: DisputePriority.MEDIUM,
  })
  priority: DisputePriority;

  @Prop({
    type: String,
    enum: Object.values(DisputeStatus),
    default: DisputeStatus.OPEN,
  })
  status: DisputeStatus;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [DisputeEvidence], default: [] })
  evidence: DisputeEvidence[];

  @Prop({ type: [DisputeMessage], default: [] })
  messages: DisputeMessage[];

  @Prop({ type: DisputeResolution })
  resolution: DisputeResolution;

  @Prop({ type: Types.ObjectId, ref: 'AdminProfile' })
  assignedTo: Types.ObjectId;

  @Prop({ type: Date })
  resolvedAt: Date;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt: Date;
}

export const DisputeSchema = SchemaFactory.createForClass(Dispute);

// Indexes
DisputeSchema.index({ orderId: 1 });
DisputeSchema.index({ reportedBy: 1, status: 1 });
DisputeSchema.index({ status: 1, priority: -1 });
DisputeSchema.index({ assignedTo: 1, status: 1 });
DisputeSchema.index({ createdAt: -1 });
