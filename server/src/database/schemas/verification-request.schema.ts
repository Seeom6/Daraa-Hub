import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerificationRequestDocument = VerificationRequest & Document;

/**
 * Document Schema for uploaded verification documents
 */
export class VerificationDocument {
  @Prop({ required: true })
  type: string; // 'national_id', 'driver_license', 'business_license', 'tax_id', etc.

  @Prop({ required: true })
  url: string;

  @Prop()
  fileName?: string;

  @Prop()
  uploadedAt: Date;

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected';

  @Prop()
  rejectionReason?: string;
}

/**
 * Verification Request Schema
 * Handles verification requests for stores and couriers
 */
@Schema({ timestamps: true })
export class VerificationRequest {
  @Prop({ type: Types.ObjectId, ref: 'Account', required: true, index: true })
  accountId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: ['store_owner', 'courier'],
    required: true,
    index: true,
  })
  applicantType: 'store_owner' | 'courier';

  @Prop({ type: Types.ObjectId, refPath: 'profileModel', required: true })
  profileId: Types.ObjectId;

  @Prop({ 
    type: String,
    enum: ['StoreOwnerProfile', 'CourierProfile'],
    required: true,
  })
  profileModel: 'StoreOwnerProfile' | 'CourierProfile';

  @Prop({ 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected', 'info_required'],
    default: 'pending',
    index: true,
  })
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'info_required';

  @Prop({ type: [VerificationDocument], default: [] })
  documents: VerificationDocument[];

  @Prop({ type: Object })
  personalInfo?: {
    fullName?: string;
    nationalId?: string;
    dateOfBirth?: Date;
    address?: string;
    city?: string;
    phone?: string;
  };

  @Prop({ type: Object })
  businessInfo?: {
    businessName?: string;
    businessLicense?: string;
    taxId?: string;
    businessAddress?: string;
    businessPhone?: string;
    businessType?: string;
  };

  @Prop({ type: Object })
  vehicleInfo?: {
    vehicleType?: string;
    vehiclePlateNumber?: string;
    vehicleModel?: string;
    vehicleColor?: string;
    driverLicense?: string;
    insuranceDocument?: string;
  };

  @Prop()
  submittedAt?: Date;

  @Prop()
  reviewStartedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  approvedAt?: Date;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  rejectionReason?: string;

  @Prop()
  infoRequired?: string; // Information required from applicant

  @Prop({ type: [String], default: [] })
  requiredInfo?: string[]; // List of missing/required information

  @Prop()
  adminNotes?: string; // Internal notes for admins

  @Prop()
  applicantNotes?: string; // Notes from the applicant

  @Prop({ type: [Object], default: [] })
  history: {
    action: string;
    performedBy: Types.ObjectId;
    timestamp: Date;
    notes?: string;
  }[];

  @Prop({ default: 0 })
  resubmissionCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export const VerificationRequestSchema = SchemaFactory.createForClass(VerificationRequest);

// Indexes
VerificationRequestSchema.index({ accountId: 1, status: 1 }); // User's verification status
VerificationRequestSchema.index({ applicantType: 1, status: 1, submittedAt: -1 }); // Admin review queue
VerificationRequestSchema.index({ status: 1, submittedAt: -1 }); // All pending verifications
VerificationRequestSchema.index({ reviewedBy: 1, reviewedAt: -1 }); // Admin's reviewed requests
VerificationRequestSchema.index({ createdAt: -1 });

