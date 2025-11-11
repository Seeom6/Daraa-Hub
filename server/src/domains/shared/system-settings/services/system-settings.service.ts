import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSettings,
  SystemSettingsDocument,
} from '../../../../database/schemas/system-settings.schema';
import { UpdateSubscriptionSettingsDto } from '../dto';

@Injectable()
export class SystemSettingsService {
  private readonly logger = new Logger(SystemSettingsService.name);

  constructor(
    @InjectModel(SystemSettings.name)
    private readonly settingsModel: Model<SystemSettingsDocument>,
  ) {}

  /**
   * Get subscription settings
   */
  async getSubscriptionSettings(): Promise<any> {
    const settings = await this.settingsModel
      .findOne({ key: 'subscription' })
      .exec();

    if (!settings) {
      // Return default settings
      return {
        subscriptionSystemEnabled: false,
        allowManualPayment: true,
        allowOnlinePayment: false,
        trialPeriodDays: 0,
        notificationSettings: {
          subscriptionExpiryWarningDays: 3,
          notifyOnSubscriptionExpiry: true,
          notifyOnDailyLimitReached: true,
          notifyOnPaymentSuccess: true,
          notifyOnPaymentFailure: true,
        },
      };
    }

    return settings.value;
  }

  /**
   * Update subscription settings (Admin only)
   */
  async updateSubscriptionSettings(
    updateDto: UpdateSubscriptionSettingsDto,
    adminId: string,
  ): Promise<any> {
    let settings = await this.settingsModel
      .findOne({ key: 'subscription' })
      .exec();

    const newValue = {
      subscriptionSystemEnabled: updateDto.subscriptionSystemEnabled ?? false,
      allowManualPayment: updateDto.allowManualPayment ?? true,
      allowOnlinePayment: updateDto.allowOnlinePayment ?? false,
      trialPeriodDays: updateDto.trialPeriodDays ?? 0,
      notificationSettings: {
        subscriptionExpiryWarningDays: updateDto.subscriptionExpiryWarningDays ?? 3,
        notifyOnSubscriptionExpiry: updateDto.notifyOnSubscriptionExpiry ?? true,
        notifyOnDailyLimitReached: updateDto.notifyOnDailyLimitReached ?? true,
        notifyOnPaymentSuccess: updateDto.notifyOnPaymentSuccess ?? true,
        notifyOnPaymentFailure: updateDto.notifyOnPaymentFailure ?? true,
      },
    };

    if (!settings) {
      // Create new settings
      settings = new this.settingsModel({
        key: 'subscription',
        category: 'features',
        value: newValue,
        description: 'Subscription system settings',
        lastModifiedBy: adminId,
        isActive: true,
      });
    } else {
      // Update existing settings
      settings.value = { ...settings.value, ...newValue };
      settings.lastModifiedBy = adminId as any;
    }

    await settings.save();

    this.logger.log(`Subscription settings updated by admin ${adminId}`);

    return settings.value;
  }

  /**
   * Check if subscription system is enabled
   */
  async isSubscriptionSystemEnabled(): Promise<boolean> {
    const settings = await this.getSubscriptionSettings();
    return settings.subscriptionSystemEnabled === true;
  }
}

