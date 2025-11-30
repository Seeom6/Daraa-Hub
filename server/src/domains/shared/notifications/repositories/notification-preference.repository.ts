import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  NotificationPreference,
  NotificationPreferenceDocument,
} from '../../../../database/schemas/notification-preference.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class NotificationPreferenceRepository extends BaseRepository<NotificationPreferenceDocument> {
  constructor(
    @InjectModel(NotificationPreference.name)
    private readonly preferenceModel: Model<NotificationPreferenceDocument>,
  ) {
    super(preferenceModel);
  }

  /**
   * Find preferences by user ID
   */
  async findByUserId(
    userId: string,
  ): Promise<NotificationPreferenceDocument | null> {
    return this.findOne({ userId: new Types.ObjectId(userId) });
  }

  /**
   * Get or create preferences for user
   */
  async getOrCreatePreferences(
    userId: string,
  ): Promise<NotificationPreferenceDocument> {
    let preferences = await this.findByUserId(userId);

    if (!preferences) {
      preferences = await this.create({
        userId: new Types.ObjectId(userId),
      } as any);
    }

    return preferences;
  }

  /**
   * Update channel preference
   */
  async updateChannelPreference(
    userId: string,
    channel: string,
    enabled: boolean,
  ): Promise<NotificationPreferenceDocument | null> {
    const preferences = await this.getOrCreatePreferences(userId);
    return this.findByIdAndUpdate((preferences as any)._id.toString(), {
      [`channels.${channel}`]: enabled,
    });
  }

  /**
   * Update category preference
   */
  async updateCategoryPreference(
    userId: string,
    category: string,
    enabled: boolean,
  ): Promise<NotificationPreferenceDocument | null> {
    const preferences = await this.getOrCreatePreferences(userId);
    return this.findByIdAndUpdate((preferences as any)._id.toString(), {
      [`categories.${category}`]: enabled,
    });
  }

  /**
   * Check if user has channel enabled
   */
  async isChannelEnabled(userId: string, channel: string): Promise<boolean> {
    const preferences = await this.findByUserId(userId);
    if (!preferences) return true; // Default to enabled

    return (preferences as any).channels?.[channel] !== false;
  }

  /**
   * Check if user has category enabled
   */
  async isCategoryEnabled(userId: string, category: string): Promise<boolean> {
    const preferences = await this.findByUserId(userId);
    if (!preferences) return true; // Default to enabled

    return (preferences as any).categories?.[category] !== false;
  }
}
