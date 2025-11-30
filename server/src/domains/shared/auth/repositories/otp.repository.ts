import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Otp, OtpDocument } from '../../../../database/schemas/otp.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class OTPRepository extends BaseRepository<OtpDocument> {
  constructor(
    @InjectModel(Otp.name)
    private readonly otpModel: Model<OtpDocument>,
  ) {
    super(otpModel);
  }

  /**
   * Find OTP by phone number and code
   */
  async findByPhoneAndCode(
    phoneNumber: string,
    code: string,
  ): Promise<OtpDocument | null> {
    return this.findOne({
      phoneNumber,
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  }

  /**
   * Find latest OTP by phone number
   */
  async findLatestByPhone(phoneNumber: string): Promise<OtpDocument | null> {
    return this.otpModel
      .findOne({ phoneNumber })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Mark OTP as used
   */
  async markAsUsed(otpId: string): Promise<OtpDocument | null> {
    return this.findByIdAndUpdate(otpId, { isUsed: true });
  }

  /**
   * Delete expired OTPs
   */
  async deleteExpired(): Promise<number> {
    const result = await this.otpModel.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount;
  }

  /**
   * Count OTPs sent to phone in last period
   */
  async countRecentByPhone(
    phoneNumber: string,
    minutes: number = 60,
  ): Promise<number> {
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - minutes);

    return this.count({
      phoneNumber,
      createdAt: { $gte: cutoffTime },
    });
  }
}
