import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AdminProfileDocument = AdminProfile & Document;

// Permission structure for granular access control
export class AdminPermissions {
  @Prop({
    type: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      suspend: { type: Boolean, default: false },
    },
    _id: false,
  })
  users: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    suspend: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      approve: { type: Boolean, default: false },
      reject: { type: Boolean, default: false },
      suspend: { type: Boolean, default: false },
    },
    _id: false,
  })
  stores: {
    view: boolean;
    approve: boolean;
    reject: boolean;
    suspend: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      approve: { type: Boolean, default: false },
      reject: { type: Boolean, default: false },
      suspend: { type: Boolean, default: false },
    },
    _id: false,
  })
  couriers: {
    view: boolean;
    approve: boolean;
    reject: boolean;
    suspend: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
      feature: { type: Boolean, default: false },
    },
    _id: false,
  })
  products: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    feature: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      cancel: { type: Boolean, default: false },
      refund: { type: Boolean, default: false },
    },
    _id: false,
  })
  orders: {
    view: boolean;
    cancel: boolean;
    refund: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      refund: { type: Boolean, default: false },
    },
    _id: false,
  })
  payments: {
    view: boolean;
    refund: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      export: { type: Boolean, default: false },
    },
    _id: false,
  })
  reports: {
    view: boolean;
    export: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
    },
    _id: false,
  })
  settings: {
    view: boolean;
    edit: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    _id: false,
  })
  coupons: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };

  @Prop({
    type: {
      view: { type: Boolean, default: false },
      create: { type: Boolean, default: false },
      edit: { type: Boolean, default: false },
      delete: { type: Boolean, default: false },
    },
    _id: false,
  })
  categories: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };

  @Prop({
    type: {
      send_bulk: { type: Boolean, default: false },
    },
    _id: false,
  })
  notifications: {
    send_bulk: boolean;
  };
}

export class ActivityLogEntry {
  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  timestamp: Date;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  details?: Record<string, any>;
}

@Schema({ timestamps: true })
export class AdminProfile {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true })
  accountId: Types.ObjectId;

  @Prop({ type: AdminPermissions, required: true })
  permissions: AdminPermissions;

  @Prop({
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    required: true,
    default: 'support',
  })
  role: 'super_admin' | 'admin' | 'moderator' | 'support';

  @Prop({
    type: String,
    enum: [
      'operations',
      'customer_service',
      'finance',
      'marketing',
      'technical',
    ],
  })
  department?: string;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ type: [ActivityLogEntry], default: [] })
  activityLog: ActivityLogEntry[];

  @Prop({ default: true })
  isActive: boolean;
}

export const AdminProfileSchema = SchemaFactory.createForClass(AdminProfile);

// Indexes
// Note: accountId already has unique: true in @Prop, which creates an index automatically
AdminProfileSchema.index({ role: 1 });
AdminProfileSchema.index({ department: 1 });
AdminProfileSchema.index({ isActive: 1 });
