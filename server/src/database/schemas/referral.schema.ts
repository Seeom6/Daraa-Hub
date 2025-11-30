import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReferralDocument = Referral & Document;

export enum ReferralStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  REWARDED = 'rewarded',
}

export enum RewardType {
  POINTS = 'points',
  DISCOUNT = 'discount',
  CASH = 'cash',
}

@Schema({ _id: false })
export class RewardDetail {
  @Prop({ type: String, enum: RewardType, required: true })
  type: RewardType;

  @Prop({ required: true, min: 0 })
  value: number;
}

@Schema({ _id: false })
export class RewardInfo {
  @Prop({ type: RewardDetail, required: true })
  referrerReward: RewardDetail;

  @Prop({ type: RewardDetail, required: true })
  referredReward: RewardDetail;
}

@Schema({ timestamps: true })
export class Referral {
  @Prop({
    type: Types.ObjectId,
    ref: 'CustomerProfile',
    required: true,
  })
  referrerId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CustomerProfile',
    unique: true,
  })
  referredId?: Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  })
  code: string;

  @Prop({
    type: String,
    enum: ReferralStatus,
    default: ReferralStatus.PENDING,
  })
  status: ReferralStatus;

  @Prop({ type: RewardInfo, required: true })
  reward: RewardInfo;

  @Prop()
  completedAt?: Date; // When referred user made first order

  @Prop()
  rewardedAt?: Date; // When rewards were given

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  firstOrderId?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);

// Indexes
ReferralSchema.index({ referrerId: 1 });
// Note: referredId and code already have unique: true in @Prop, which creates indexes automatically
ReferralSchema.index({ status: 1 });
