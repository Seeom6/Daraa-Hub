import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotificationPreference, NotificationPreferenceDocument } from '../../../../database/schemas/notification-preference.schema';
import { UpdateNotificationPreferenceDto } from '../dto/update-notification-preference.dto';

@Injectable()
export class NotificationPreferenceService {
  private readonly logger = new Logger(NotificationPreferenceService.name);

  constructor(
    @InjectModel(NotificationPreference.name)
    private notificationPreferenceModel: Model<NotificationPreferenceDocument>,
  ) {}

  /**
   * Get user's notification preferences (create default if not exists)
   */
  async getPreferences(userId: string): Promise<NotificationPreferenceDocument> {
    let preferences = await this.notificationPreferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!preferences) {
      // Create default preferences
      preferences = await this.createDefaultPreferences(userId) as any;
    }

    return preferences!;
  }

  /**
   * Update user's notification preferences
   */
  async updatePreferences(
    userId: string,
    updateDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceDocument> {
    let preferences = await this.notificationPreferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    if (!preferences) {
      preferences = await this.createDefaultPreferences(userId) as any;
    }

    // Update preferences
    if (updateDto.channels) {
      preferences!.channels = { ...preferences!.channels, ...updateDto.channels };
    }

    if (updateDto.categories) {
      preferences!.categories = { ...preferences!.categories, ...updateDto.categories };
    }

    if (updateDto.quietHours !== undefined) {
      preferences!.quietHours = updateDto.quietHours as any;
    }

    if (updateDto.language) {
      preferences!.language = updateDto.language;
    }

    if (updateDto.emailDigest) {
      preferences!.emailDigest = updateDto.emailDigest;
    }

    await preferences!.save();
    this.logger.log(`Updated notification preferences for user ${userId}`);

    return preferences!;
  }

  /**
   * Check if user should receive notification on a specific channel
   */
  async shouldReceiveOnChannel(
    userId: string,
    channel: 'push' | 'email' | 'sms' | 'in_app',
    category: string,
  ): Promise<boolean> {
    const preferences = await this.getPreferences(userId);

    // Check if channel is enabled
    if (!preferences.channels[channel]) {
      return false;
    }

    // Check if category is enabled
    if (preferences.categories[category] === false) {
      return false;
    }

    // Check quiet hours (only for push and sms)
    if ((channel === 'push' || channel === 'sms') && preferences.quietHours?.enabled) {
      if (this.isInQuietHours(preferences.quietHours)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get user's preferred language
   */
  async getPreferredLanguage(userId: string): Promise<'ar' | 'en'> {
    const preferences = await this.getPreferences(userId);
    return preferences.language;
  }

  /**
   * Create default preferences for a user
   */
  private async createDefaultPreferences(userId: string): Promise<NotificationPreferenceDocument> {
    const preferences = new this.notificationPreferenceModel({
      userId: new Types.ObjectId(userId),
      channels: {
        push: true,
        email: true,
        sms: true,
        in_app: true,
      },
      categories: {
        orders: true,
        payments: true,
        delivery: true,
        verification: true,
        account: true,
        promotions: true,
        system: true,
        security: true,
        reviews: true,
        disputes: true,
      },
      language: 'ar',
      emailDigest: 'instant',
    });

    await preferences.save();
    this.logger.log(`Created default notification preferences for user ${userId}`);

    return preferences;
  }

  /**
   * Check if current time is in quiet hours
   */
  private isInQuietHours(quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  }): boolean {
    if (!quietHours.enabled) {
      return false;
    }

    try {
      const now = new Date();
      const currentTime = now.toLocaleTimeString('en-US', {
        hour12: false,
        timeZone: quietHours.timezone,
      });

      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      const [startHour, startMinute] = quietHours.startTime.split(':').map(Number);
      const [endHour, endMinute] = quietHours.endTime.split(':').map(Number);

      const currentMinutes = currentHour * 60 + currentMinute;
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;

      // Handle overnight quiet hours (e.g., 22:00 - 08:00)
      if (startMinutes > endMinutes) {
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
      }

      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } catch (error) {
      this.logger.error(`Error checking quiet hours: ${error.message}`);
      return false;
    }
  }
}

