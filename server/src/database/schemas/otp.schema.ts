import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, index: true })
  phoneNumber: string;

  @Prop({ required: true })
  otp: string; // Hashed OTP

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ enum: ['registration', 'forgot-password'], required: true })
  type: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Index for faster phone number lookups and automatic deletion of expired OTPs
OtpSchema.index({ phoneNumber: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

