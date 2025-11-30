import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSettings,
  SystemSettingsDocument,
} from '../../../../database/schemas/system-settings.schema';

/**
 * Service for initializing default settings
 */
@Injectable()
export class SettingsDefaultsService {
  private readonly logger = new Logger(SettingsDefaultsService.name);

  constructor(
    @InjectModel(SystemSettings.name)
    private systemSettingsModel: Model<SystemSettingsDocument>,
  ) {}

  async initializeDefaults(): Promise<void> {
    const defaults = [
      {
        key: 'general',
        category: 'general',
        value: {
          platformName: 'Daraa',
          platformNameAr: 'درعا',
          supportEmail: 'support@daraa.com',
          supportPhone: '+963XXXXXXXXX',
          currency: 'SYP',
          language: 'ar',
          timezone: 'Asia/Damascus',
          maintenanceMode: false,
          maintenanceMessage: '',
        },
        description: 'General platform settings',
      },
      {
        key: 'payment',
        category: 'payment',
        value: {
          enableCashOnDelivery: true,
          enableOnlinePayment: false,
          enableWallet: true,
          paymentGateways: [],
          minOrderAmount: 1000,
          maxOrderAmount: 1000000,
          refundPolicy: 'Within 7 days',
        },
        description: 'Payment configuration',
      },
      {
        key: 'shipping',
        category: 'shipping',
        value: {
          baseDeliveryFee: 500,
          freeDeliveryThreshold: 5000,
          maxDeliveryDistance: 50,
          estimatedDeliveryTime: '30-60 minutes',
          enableScheduledDelivery: false,
        },
        description: 'Shipping and delivery settings',
      },
      {
        key: 'notifications',
        category: 'notifications',
        value: {
          enablePushNotifications: true,
          enableEmailNotifications: true,
          enableSmsNotifications: true,
          notifyOnOrderPlaced: true,
          notifyOnOrderAccepted: true,
          notifyOnOrderDelivered: true,
          notifyOnPaymentReceived: true,
        },
        description: 'Notification preferences',
      },
      {
        key: 'security',
        category: 'security',
        value: {
          enableTwoFactorAuth: false,
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          lockoutDuration: 900,
          passwordMinLength: 8,
          passwordRequireUppercase: false,
          passwordRequireNumbers: true,
          passwordRequireSpecialChars: false,
        },
        description: 'Security settings',
      },
      {
        key: 'commission',
        category: 'commission',
        value: {
          defaultStoreCommission: 10,
          defaultCourierCommission: 20,
          minimumPayout: 10000,
          payoutSchedule: 'weekly',
        },
        description: 'Commission and payout settings',
      },
      {
        key: 'features',
        category: 'features',
        value: {
          enableReviews: true,
          enableLoyaltyPoints: true,
          enableCoupons: true,
          enableReferrals: false,
          enableChat: false,
          enableDisputes: true,
          enableSubscriptions: false,
        },
        description: 'Feature toggles',
      },
    ];

    for (const defaultSetting of defaults) {
      const existing = await this.systemSettingsModel
        .findOne({ key: defaultSetting.key })
        .exec();
      if (!existing) {
        const settings = new this.systemSettingsModel(defaultSetting);
        await settings.save();
        this.logger.log(`Default settings initialized: ${defaultSetting.key}`);
      }
    }
  }
}
