import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CourierProfileDocument = CourierProfile & Document;

/**
 * Location Schema for courier tracking
 */
export class Location {
  @Prop({ required: true })
  type: string; // 'Point'

  @Prop({ type: [Number], required: true })
  coordinates: number[]; // [longitude, latitude]
}

/**
 * Courier Profile Schema
 * Profile for delivery workers
 */
@Schema({ timestamps: true })
export class CourierProfile {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, unique: true, index: true })
  accountId: Types.ObjectId;

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
  driverLicense?: string;

  @Prop()
  nationalId?: string; // ID card or passport

  @Prop()
  vehicleType?: string; // 'motorcycle', 'car', 'bicycle', 'scooter'

  @Prop()
  vehiclePlateNumber?: string;

  @Prop()
  vehicleModel?: string;

  @Prop()
  vehicleColor?: string;

  @Prop()
  vehicleRegistration?: string; // Vehicle registration document

  @Prop()
  insuranceDocument?: string;

  @Prop({ 
    type: String, 
    enum: ['offline', 'available', 'busy', 'on_break'], 
    default: 'offline' 
  })
  status: 'offline' | 'available' | 'busy' | 'on_break';

  @Prop({ 
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    }, 
    coordinates: { 
      type: [Number], 
      default: [0, 0] 
    } 
  })
  currentLocation?: Location;

  @Prop({ type: Number, default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalReviews: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalDeliveries: number;

  @Prop({ type: Number, default: 0, min: 0 })
  totalEarnings: number;

  @Prop({ type: [Types.ObjectId], ref: 'Order', default: [] })
  deliveries: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'Order', default: [] })
  activeDeliveries: Types.ObjectId[];

  @Prop({ default: true })
  isAvailableForDelivery: boolean;

  // Suspension fields (separate from account suspension)
  @Prop({ default: false })
  isCourierSuspended: boolean;

  @Prop()
  courierSuspendedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  courierSuspendedBy?: Types.ObjectId;

  @Prop()
  courierSuspensionReason?: string;

  // Commission settings
  @Prop({ type: Number, default: 20, min: 0, max: 100 })
  commissionRate: number; // Percentage of delivery fee

  // Working hours
  @Prop({ type: Object })
  workingHours?: {
    monday?: { start: string; end: string };
    tuesday?: { start: string; end: string };
    wednesday?: { start: string; end: string };
    thursday?: { start: string; end: string };
    friday?: { start: string; end: string };
    saturday?: { start: string; end: string };
    sunday?: { start: string; end: string };
  };

  createdAt: Date;
  updatedAt: Date;
}

export const CourierProfileSchema = SchemaFactory.createForClass(CourierProfile);

// Indexes
CourierProfileSchema.index({ accountId: 1 });
CourierProfileSchema.index({ verificationStatus: 1 });
CourierProfileSchema.index({ status: 1 });
CourierProfileSchema.index({ rating: -1 });
CourierProfileSchema.index({ isAvailableForDelivery: 1 });
CourierProfileSchema.index({ isCourierSuspended: 1 });
CourierProfileSchema.index({ verificationSubmittedAt: 1 });
CourierProfileSchema.index({ currentLocation: '2dsphere' }); // Geospatial index

