import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DeviceToken,
  DeviceTokenDocument,
} from '../../../../database/schemas/device-token.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class DeviceTokenRepository extends BaseRepository<DeviceTokenDocument> {
  constructor(
    @InjectModel(DeviceToken.name)
    private readonly deviceTokenModel: Model<DeviceTokenDocument>,
  ) {
    super(deviceTokenModel);
  }

  /**
   * Find tokens by user ID
   */
  async findByUserId(userId: string): Promise<DeviceTokenDocument[]> {
    return this.find({
      userId: new Types.ObjectId(userId),
      isActive: true,
    });
  }

  /**
   * Find token by device ID
   */
  async findByDeviceId(deviceId: string): Promise<DeviceTokenDocument | null> {
    return this.findOne({ deviceId });
  }

  /**
   * Find token by FCM token
   */
  async findByToken(token: string): Promise<DeviceTokenDocument | null> {
    return this.findOne({ token });
  }

  /**
   * Register or update device token
   */
  async registerToken(
    userId: string,
    deviceId: string,
    token: string,
    platform: string,
  ): Promise<DeviceTokenDocument> {
    const existing = await this.findByDeviceId(deviceId);

    if (existing) {
      return (await this.findByIdAndUpdate((existing as any)._id.toString(), {
        token,
        platform,
        isActive: true,
        lastUsedAt: new Date(),
      }))!;
    }

    return this.create({
      userId: new Types.ObjectId(userId),
      deviceId,
      token,
      platform,
      isActive: true,
      lastUsedAt: new Date(),
    } as any);
  }

  /**
   * Deactivate token
   */
  async deactivateToken(deviceId: string): Promise<DeviceTokenDocument | null> {
    const token = await this.findByDeviceId(deviceId);
    if (!token) return null;

    return this.findByIdAndUpdate((token as any)._id.toString(), { isActive: false });
  }

  /**
   * Update last used timestamp
   */
  async updateLastUsed(tokenId: string): Promise<DeviceTokenDocument | null> {
    return this.findByIdAndUpdate(tokenId, { lastUsedAt: new Date() });
  }

  /**
   * Delete inactive tokens
   */
  async deleteInactiveTokens(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.deviceTokenModel.deleteMany({
      isActive: false,
      lastUsedAt: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }
}

