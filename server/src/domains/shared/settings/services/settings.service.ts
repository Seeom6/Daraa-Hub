import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemSettings, SystemSettingsDocument } from '../../../../database/schemas/system-settings.schema';
import { CreateSettingsDto } from '../dto/create-settings.dto';
import { UpdateSettingsDto } from '../dto/update-settings.dto';
import { RedisService } from '../../../../infrastructure/redis/redis.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly CACHE_PREFIX = 'settings:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectModel(SystemSettings.name)
    private systemSettingsModel: Model<SystemSettingsDocument>,
    private redisService: RedisService,
  ) {}

  async create(createSettingsDto: CreateSettingsDto, adminId: string): Promise<SystemSettingsDocument> {
    // Check if settings with this key already exist
    const existing = await this.systemSettingsModel.findOne({ key: createSettingsDto.key }).exec();
    if (existing) {
      throw new ConflictException(`Settings with key '${createSettingsDto.key}' already exist`);
    }

    const settings = new this.systemSettingsModel({
      ...createSettingsDto,
      lastModifiedBy: adminId,
    });

    const saved = await settings.save();
    
    // Cache the new settings
    await this.cacheSettings(saved.key, saved);
    
    this.logger.log(`Settings created: ${saved.key} by admin: ${adminId}`);
    return saved;
  }

  async findAll(category?: string): Promise<SystemSettingsDocument[]> {
    const query = category ? { category } : {};
    return this.systemSettingsModel.find(query).exec();
  }

  async findByKey(key: string): Promise<SystemSettingsDocument> {
    // Try to get from cache first
    const cached = await this.getCachedSettings(key);
    if (cached) {
      return cached;
    }

    // If not in cache, get from database
    const settings = await this.systemSettingsModel.findOne({ key }).exec();
    if (!settings) {
      throw new NotFoundException(`Settings with key '${key}' not found`);
    }

    // Cache for future requests
    await this.cacheSettings(key, settings);

    return settings;
  }

  async update(key: string, updateSettingsDto: UpdateSettingsDto, adminId: string): Promise<SystemSettingsDocument> {
    const settings = await this.systemSettingsModel
      .findOneAndUpdate(
        { key },
        {
          ...updateSettingsDto,
          lastModifiedBy: adminId,
        },
        { new: true },
      )
      .exec();

    if (!settings) {
      throw new NotFoundException(`Settings with key '${key}' not found`);
    }

    // Update cache
    await this.cacheSettings(key, settings);

    this.logger.log(`Settings updated: ${key} by admin: ${adminId}`);
    return settings;
  }

  async updateValue(key: string, value: Record<string, any>, adminId: string): Promise<SystemSettingsDocument> {
    const settings = await this.systemSettingsModel
      .findOneAndUpdate(
        { key },
        {
          value,
          lastModifiedBy: adminId,
        },
        { new: true },
      )
      .exec();

    if (!settings) {
      throw new NotFoundException(`Settings with key '${key}' not found`);
    }

    // Update cache
    await this.cacheSettings(key, settings);

    this.logger.log(`Settings value updated: ${key} by admin: ${adminId}`);
    return settings;
  }

  async delete(key: string): Promise<void> {
    const result = await this.systemSettingsModel.deleteOne({ key }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Settings with key '${key}' not found`);
    }

    // Remove from cache
    await this.deleteCachedSettings(key);

    this.logger.log(`Settings deleted: ${key}`);
  }

  async getValue<T = any>(key: string, defaultValue?: T): Promise<T> {
    try {
      const settings = await this.findByKey(key);
      return settings.value as T;
    } catch (error) {
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  async getValueByPath<T = any>(key: string, path: string, defaultValue?: T): Promise<T> {
    const settings = await this.findByKey(key);
    const pathParts = path.split('.');
    let value: any = settings.value;

    for (const part of pathParts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new NotFoundException(`Path '${path}' not found in settings '${key}'`);
      }
    }

    return value as T;
  }

  // Cache helpers
  private async cacheSettings(key: string, settings: SystemSettingsDocument): Promise<void> {
    try {
      await this.redisService.set(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify(settings),
        this.CACHE_TTL,
      );
    } catch (error) {
      this.logger.warn(`Failed to cache settings: ${key}`, error);
    }
  }

  private async getCachedSettings(key: string): Promise<SystemSettingsDocument | null> {
    try {
      const cached = await this.redisService.get(`${this.CACHE_PREFIX}${key}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      this.logger.warn(`Failed to get cached settings: ${key}`, error);
    }
    return null;
  }

  private async deleteCachedSettings(key: string): Promise<void> {
    try {
      await this.redisService.del(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      this.logger.warn(`Failed to delete cached settings: ${key}`, error);
    }
  }

  // Initialize default settings
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
      const existing = await this.systemSettingsModel.findOne({ key: defaultSetting.key }).exec();
      if (!existing) {
        const settings = new this.systemSettingsModel(defaultSetting);
        await settings.save();
        this.logger.log(`Default settings initialized: ${defaultSetting.key}`);
      }
    }
  }
}

