import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InventoryDocument = Inventory & Document;

export enum MovementType {
  IN = 'in',
  OUT = 'out',
  ADJUSTMENT = 'adjustment',
  RETURN = 'return',
}

export interface StockMovement {
  type: MovementType;
  quantity: number;
  reason: string;
  orderId?: Types.ObjectId;
  performedBy: Types.ObjectId;
  timestamp: Date;
  notes?: string;
}

@Schema({ timestamps: true })
export class Inventory {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ProductVariant' })
  variantId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'StoreOwnerProfile',
    required: true,
  })
  storeId: Types.ObjectId;

  @Prop({ required: true, default: 0, min: 0 })
  quantity: number;

  @Prop({ default: 0, min: 0 })
  reservedQuantity: number;

  @Prop({ default: 0, min: 0 })
  availableQuantity: number; // quantity - reservedQuantity

  @Prop({ default: 10, min: 0 })
  lowStockThreshold: number;

  @Prop({ default: 5, min: 0 })
  reorderPoint: number;

  @Prop({ default: 50, min: 0 })
  reorderQuantity: number;

  @Prop()
  lastRestocked?: Date;

  @Prop({
    type: [
      {
        type: {
          type: String,
          enum: Object.values(MovementType),
          required: true,
        },
        quantity: { type: Number, required: true },
        reason: { type: String, required: true },
        orderId: { type: Types.ObjectId, ref: 'Order' },
        performedBy: { type: Types.ObjectId, ref: 'Account', required: true },
        timestamp: { type: Date, default: Date.now },
        notes: String,
      },
    ],
    default: [],
  })
  movements: StockMovement[];

  createdAt: Date;
  updatedAt: Date;
}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

// Indexes
InventorySchema.index({ productId: 1, storeId: 1 }, { unique: true });
InventorySchema.index({ variantId: 1, storeId: 1 });
InventorySchema.index({ storeId: 1, availableQuantity: 1 });
InventorySchema.index({ availableQuantity: 1 });

// Pre-save hook to calculate available quantity
InventorySchema.pre('save', function (next) {
  this.availableQuantity = this.quantity - this.reservedQuantity;
  next();
});
