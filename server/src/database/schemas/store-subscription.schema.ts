import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface StoreSubscriptionMethods {
  getTodayUsage(): number;
  incrementTodayUsage(): Promise<void>;
}

export type StoreSubscriptionDocument = StoreSubscription & Document & StoreSubscriptionMethods;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  PENDING_PAYMENT = 'pending_payment',
}

export enum SubscriptionPaymentMethod {
  MANUAL = 'manual',        // Admin activates after manual payment
  ONLINE = 'online',        // Online payment gateway (future)
  FREE_GRANT = 'free_grant', // Admin grants for free
}

export interface DailyUsage {
  date: string; // YYYY-MM-DD
  productsPublished: number;
}

@Schema({ timestamps: true })
export class StoreSubscription {
  @Prop({ type: Types.ObjectId, ref: 'StoreOwnerProfile', required: true, index: true })
  storeId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan', required: true })
  planId: Types.ObjectId;

  @Prop({ type: String, enum: SubscriptionStatus, default: SubscriptionStatus.PENDING_PAYMENT, index: true })
  status: SubscriptionStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true, index: true })
  endDate: Date;

  @Prop({ type: String, enum: SubscriptionPaymentMethod, required: true })
  paymentMethod: SubscriptionPaymentMethod;

  @Prop({ min: 0 })
  amountPaid?: number; // Amount paid in USD

  @Prop()
  paymentReference?: string; // Payment reference/transaction ID

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  activatedBy?: Types.ObjectId; // Admin who activated (for manual/free)

  @Prop()
  activatedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  cancelledBy?: Types.ObjectId;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  cancellationReason?: string;

  // Daily usage tracking
  @Prop({
    type: [{
      date: { type: String, required: true },
      productsPublished: { type: Number, default: 0 },
    }],
    default: [],
  })
  dailyUsage: DailyUsage[];

  @Prop({ default: 0, min: 0 })
  totalProductsPublished: number;

  // Auto-renewal (for future online payments)
  @Prop({ default: false })
  autoRenew: boolean;

  @Prop()
  notes?: string; // Admin notes

  createdAt: Date;
  updatedAt: Date;
}

export const StoreSubscriptionSchema = SchemaFactory.createForClass(StoreSubscription);

// Indexes
StoreSubscriptionSchema.index({ storeId: 1, status: 1 });
StoreSubscriptionSchema.index({ endDate: 1, status: 1 });
StoreSubscriptionSchema.index({ status: 1 });

// Method to get today's usage
StoreSubscriptionSchema.methods.getTodayUsage = function(): number {
  const today = new Date().toISOString().split('T')[0];
  const todayUsage = this.dailyUsage.find((u: DailyUsage) => u.date === today);
  return todayUsage ? todayUsage.productsPublished : 0;
};

// Method to increment today's usage
StoreSubscriptionSchema.methods.incrementTodayUsage = async function(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const todayUsageIndex = this.dailyUsage.findIndex((u: DailyUsage) => u.date === today);
  
  if (todayUsageIndex >= 0) {
    this.dailyUsage[todayUsageIndex].productsPublished += 1;
  } else {
    this.dailyUsage.push({ date: today, productsPublished: 1 });
  }
  
  this.totalProductsPublished += 1;
  await this.save();
};

