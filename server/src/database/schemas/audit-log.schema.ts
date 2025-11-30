import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

/**
 * Audit Log Schema
 * Tracks all important actions in the system for security and compliance
 */
@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true })
  performedBy: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  action: string; // e.g., 'user.suspend', 'store.approve', 'order.cancel'

  @Prop({
    type: String,
    enum: [
      'user',
      'store',
      'courier',
      'product',
      'order',
      'payment',
      'system',
      'security',
    ],
    required: true,
  })
  category:
    | 'user'
    | 'store'
    | 'courier'
    | 'product'
    | 'order'
    | 'payment'
    | 'system'
    | 'security';

  @Prop({
    type: String,
    enum: [
      'create',
      'read',
      'update',
      'delete',
      'approve',
      'reject',
      'suspend',
      'other',
    ],
    required: true,
  })
  actionType:
    | 'create'
    | 'read'
    | 'update'
    | 'delete'
    | 'approve'
    | 'reject'
    | 'suspend'
    | 'other';

  @Prop({ type: Types.ObjectId, refPath: 'targetModel' })
  targetId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: [
      'Account',
      'StoreOwnerProfile',
      'CourierProfile',
      'Product',
      'Order',
      'Payment',
      'SystemSettings',
    ],
  })
  targetModel?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>; // Additional context data

  @Prop({ type: Object })
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };

  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  userAgent?: string;

  @Prop({
    type: String,
    enum: ['success', 'failure', 'warning'],
    default: 'success',
  })
  status: 'success' | 'failure' | 'warning';

  @Prop()
  errorMessage?: string;

  @Prop()
  description?: string; // Human-readable description

  createdAt: Date;
  updatedAt: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for efficient querying
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, createdAt: -1 });
AuditLogSchema.index({ targetId: 1, createdAt: -1 });
AuditLogSchema.index({ createdAt: -1 }); // For time-based queries
AuditLogSchema.index({ status: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, actionType: 1, createdAt: -1 }); // Compound for filtering
AuditLogSchema.index({ targetModel: 1, targetId: 1 }); // For entity-specific queries
AuditLogSchema.index({ ipAddress: 1, createdAt: -1 }); // For IP-based security queries

// TTL index - automatically delete logs older than 1 year
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 31536000 });
