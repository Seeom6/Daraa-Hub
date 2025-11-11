import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeviceToken, DeviceTokenDocument } from '../../../../database/schemas/device-token.schema';
import { RegisterDeviceTokenDto } from '../dto/register-device-token.dto';

@Injectable()
export class DeviceTokenService {
  private readonly logger = new Logger(DeviceTokenService.name);

  constructor(
    @InjectModel(DeviceToken.name)
    private deviceTokenModel: Model<DeviceTokenDocument>,
  ) {}

  /**
   * Register a new device token
   */
  async registerToken(
    userId: string,
    registerDto: RegisterDeviceTokenDto,
  ): Promise<DeviceTokenDocument> {
    // Check if token already exists
    const existingToken = await this.deviceTokenModel
      .findOne({ token: registerDto.token })
      .exec();

    if (existingToken) {
      // Update existing token
      existingToken.userId = new Types.ObjectId(userId);
      existingToken.platform = registerDto.platform;
      existingToken.deviceInfo = registerDto.deviceInfo;
      existingToken.isActive = true;
      existingToken.lastUsedAt = new Date();
      await existingToken.save();

      this.logger.log(`Updated existing device token for user ${userId}`);
      return existingToken;
    }

    // Create new token
    const deviceToken = new this.deviceTokenModel({
      userId: new Types.ObjectId(userId),
      token: registerDto.token,
      platform: registerDto.platform,
      deviceInfo: registerDto.deviceInfo,
      isActive: true,
      lastUsedAt: new Date(),
    });

    await deviceToken.save();
    this.logger.log(`Registered new device token for user ${userId} on ${registerDto.platform}`);

    return deviceToken;
  }

  /**
   * Get all active tokens for a user
   */
  async getUserTokens(userId: string): Promise<DeviceTokenDocument[]> {
    return this.deviceTokenModel
      .find({
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .exec();
  }

  /**
   * Get active tokens by platform
   */
  async getUserTokensByPlatform(
    userId: string,
    platform: 'ios' | 'android' | 'web',
  ): Promise<DeviceTokenDocument[]> {
    return this.deviceTokenModel
      .find({
        userId: new Types.ObjectId(userId),
        platform,
        isActive: true,
      })
      .exec();
  }

  /**
   * Deactivate a device token
   */
  async deactivateToken(tokenId: string, userId: string): Promise<void> {
    const result = await this.deviceTokenModel
      .updateOne(
        {
          _id: new Types.ObjectId(tokenId),
          userId: new Types.ObjectId(userId),
        },
        {
          isActive: false,
        },
      )
      .exec();

    if (result.modifiedCount === 0) {
      throw new Error('Device token not found or already deactivated');
    }

    this.logger.log(`Deactivated device token ${tokenId} for user ${userId}`);
  }

  /**
   * Delete a device token
   */
  async deleteToken(tokenId: string, userId: string): Promise<void> {
    const result = await this.deviceTokenModel
      .deleteOne({
        _id: new Types.ObjectId(tokenId),
        userId: new Types.ObjectId(userId),
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new Error('Device token not found');
    }

    this.logger.log(`Deleted device token ${tokenId} for user ${userId}`);
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(tokenId: string): Promise<void> {
    await this.deviceTokenModel
      .updateOne(
        { _id: new Types.ObjectId(tokenId) },
        { lastUsedAt: new Date() },
      )
      .exec();
  }

  /**
   * Mark token as invalid (for failed deliveries)
   */
  async markAsInvalid(token: string): Promise<void> {
    await this.deviceTokenModel
      .updateOne(
        { token },
        { isActive: false },
      )
      .exec();

    this.logger.warn(`Marked device token as invalid: ${token.substring(0, 20)}...`);
  }

  /**
   * Clean up old inactive tokens
   */
  async cleanupInactiveTokens(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deviceTokenModel
      .deleteMany({
        isActive: false,
        lastUsedAt: { $lt: cutoffDate },
      })
      .exec();

    this.logger.log(`Cleaned up ${result.deletedCount} inactive device tokens`);
    return result.deletedCount;
  }
}

