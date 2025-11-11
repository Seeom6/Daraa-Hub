import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StoreOwnerProfileDocument = StoreOwnerProfile & Document;

/**
 * Store Owner Profile Schema
 * Profile for merchants/store owners
 */
@Schema({ timestamps: true })
export class StoreOwnerProfile {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true, index: true })
  accountId: Types.ObjectId;

  @Prop({ trim: true })
  storeName?: string;

  @Prop()
  storeDescription?: string;

  @Prop()
  storeLogo?: string;

  @Prop()
  storeBanner?: string;

  @Prop({ type: Types.ObjectId, ref: 'StoreCategory', index: true })
  primaryCategory?: Types.ObjectId; // التصنيف الرئيسي للمتجر

  @Prop({ type: [Types.ObjectId], ref: 'StoreCategory', default: [], index: true })
  storeCategories: Types.ObjectId[]; // تصنيفات المتجر (يمكن أن يكون للمتجر عدة تصنيفات)

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  })
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'suspended';

  @Prop()
  verificationSubmittedAt?: Date;

  @Prop()
  verificationReviewedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  verificationReviewedBy?: Types.ObjectId;

  @Prop()
  verificationRejectionReason?: string;

  @Prop()
  businessLicense?: string;

  @Prop()
  taxId?: string;

  @Prop()
  nationalId?: string; // ID card or passport

  @Prop()
  businessAddress?: string;

  @Prop()
  businessPhone?: string;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalReviews: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalSales: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalRevenue: number;

  @Prop({ type: [Types.ObjectId], ref: 'Product', default: [] })
  products: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Order', default: [] })
  orders: Types.ObjectId[];

  @Prop({ default: true })
  isStoreActive: boolean;

  // Suspension fields (separate from account suspension)
  @Prop({ default: false })
  isStoreSuspended: boolean;

  @Prop()
  storeSuspendedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  storeSuspendedBy?: Types.ObjectId;

  @Prop()
  storeSuspensionReason?: string;

  // Commission settings
  @Prop({ type: Number, default: 10, min: 0, max: 100 })
  commissionRate: number; // Percentage

  // Subscription fields
  @Prop({ type: Types.ObjectId, ref: 'SubscriptionPlan' })
  currentPlanId?: Types.ObjectId;

  @Prop()
  subscriptionExpiresAt?: Date;

  @Prop({ default: false })
  hasActiveSubscription: boolean;

  @Prop({ default: 0, min: 0 })
  dailyProductLimit: number; // Current daily limit based on plan

  @Prop({ default: 0, min: 0 })
  maxImagesPerProduct: number; // Current image limit based on plan

  @Prop({ default: 0, min: 0 })
  maxVariantsPerProduct: number; // Current variant limit based on plan

  createdAt: Date;
  updatedAt: Date;
}

export const StoreOwnerProfileSchema = SchemaFactory.createForClass(StoreOwnerProfile);

// Virtuals
StoreOwnerProfileSchema.virtual('inventory', {
  ref: 'Inventory',
  localField: '_id',
  foreignField: 'storeId',
});

// Middleware to update storeCount in categories
// Store original categories before update
StoreOwnerProfileSchema.pre('save', async function(next) {
  if (!this.isNew && this.isModified('storeCategories')) {
    // Store original categories in a temporary property
    const original: any = await this.model('StoreOwnerProfile')
      .findById(this._id)
      .select('storeCategories')
      .lean()
      .exec();

    (this as any)._originalCategories = original?.storeCategories || [];
  }
  next();
});

// Update storeCount after save
StoreOwnerProfileSchema.post('save', async function(doc) {
  const StoreCategory = this.model('StoreCategory');

  if (doc.isNew) {
    // New document - increment counts for all categories
    if (doc.storeCategories && doc.storeCategories.length > 0) {
      await StoreCategory.updateMany(
        { _id: { $in: doc.storeCategories } },
        { $inc: { storeCount: 1 } }
      );
    }
  } else if ((doc as any)._originalCategories) {
    // Updated document - calculate diff
    const oldCategories = ((doc as any)._originalCategories || []).map((id: any) => id.toString());
    const newCategories = (doc.storeCategories || []).map((id: any) => id.toString());

    // Categories to add (increment)
    const toAdd = newCategories.filter((id: string) => !oldCategories.includes(id));
    if (toAdd.length > 0) {
      await StoreCategory.updateMany(
        { _id: { $in: toAdd } },
        { $inc: { storeCount: 1 } }
      );
    }

    // Categories to remove (decrement)
    const toRemove = oldCategories.filter((id: string) => !newCategories.includes(id));
    if (toRemove.length > 0) {
      await StoreCategory.updateMany(
        { _id: { $in: toRemove } },
        { $inc: { storeCount: -1 } }
      );
    }

    // Clean up temporary property
    delete (doc as any)._originalCategories;
  }
});

// عند حذف StoreOwnerProfile
StoreOwnerProfileSchema.pre('deleteOne', { document: true, query: false }, async function() {
  const StoreCategory = this.model('StoreCategory');

  if (this.storeCategories && this.storeCategories.length > 0) {
    await StoreCategory.updateMany(
      { _id: { $in: this.storeCategories } },
      { $inc: { storeCount: -1 } }
    );
  }
});

StoreOwnerProfileSchema.pre('findOneAndDelete', async function() {
  const StoreCategory = (this as any).model('StoreCategory');
  const doc = await (this as any).model.findOne(this.getQuery());

  if (doc && doc.storeCategories && doc.storeCategories.length > 0) {
    await StoreCategory.updateMany(
      { _id: { $in: doc.storeCategories } },
      { $inc: { storeCount: -1 } }
    );
  }
});

StoreOwnerProfileSchema.virtual('settings', {
  ref: 'StoreSettings',
  localField: '_id',
  foreignField: 'storeId',
  justOne: true,
});

StoreOwnerProfileSchema.virtual('subscriptions', {
  ref: 'StoreSubscription',
  localField: '_id',
  foreignField: 'storeId',
});

StoreOwnerProfileSchema.virtual('currentSubscription', {
  ref: 'StoreSubscription',
  localField: '_id',
  foreignField: 'storeId',
  justOne: true,
  match: { status: 'active' },
});

// Ensure virtuals are included in JSON
StoreOwnerProfileSchema.set('toJSON', { virtuals: true });
StoreOwnerProfileSchema.set('toObject', { virtuals: true });

// Indexes
StoreOwnerProfileSchema.index({ accountId: 1 });
StoreOwnerProfileSchema.index({ verificationStatus: 1 });
StoreOwnerProfileSchema.index({ rating: -1 });
StoreOwnerProfileSchema.index({ isStoreActive: 1 });
StoreOwnerProfileSchema.index({ isStoreSuspended: 1 });
StoreOwnerProfileSchema.index({ primaryCategory: 1 });
StoreOwnerProfileSchema.index({ storeCategories: 1 });
StoreOwnerProfileSchema.index({ verificationSubmittedAt: 1 });

