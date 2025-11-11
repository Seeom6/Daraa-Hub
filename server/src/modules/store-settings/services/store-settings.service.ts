import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StoreSettings, StoreSettingsDocument } from '../../../database/schemas/store-settings.schema';
import { UpdateStoreSettingsDto } from '../dto';

@Injectable()
export class StoreSettingsService {
  private readonly logger = new Logger(StoreSettingsService.name);

  constructor(
    @InjectModel(StoreSettings.name)
    private readonly storeSettingsModel: Model<StoreSettingsDocument>,
  ) {}

  async getOrCreate(storeId: string): Promise<StoreSettingsDocument> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new BadRequestException('Invalid store ID');
    }

    let settings = await this.storeSettingsModel.findOne({ storeId: new Types.ObjectId(storeId) }).exec();

    if (!settings) {
      // Create default settings for the store
      settings = new this.storeSettingsModel({
        storeId: new Types.ObjectId(storeId),
      });
      await settings.save();
      this.logger.log(`Default settings created for store: ${storeId}`);
    }

    return settings;
  }

  async findByStoreId(storeId: string): Promise<StoreSettingsDocument> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new BadRequestException('Invalid store ID');
    }

    const settings = await this.storeSettingsModel
      .findOne({ storeId: new Types.ObjectId(storeId) })
      .exec();

    if (!settings) {
      throw new NotFoundException('Store settings not found');
    }

    return settings;
  }

  async update(
    storeId: string,
    updateStoreSettingsDto: UpdateStoreSettingsDto,
    userId: string,
  ): Promise<StoreSettingsDocument> {
    if (!Types.ObjectId.isValid(storeId)) {
      throw new BadRequestException('Invalid store ID');
    }

    // Get or create settings
    const settings = await this.getOrCreate(storeId);

    // Update settings
    Object.assign(settings, updateStoreSettingsDto);
    const updated = await settings.save();

    this.logger.log(`Store settings updated for store: ${storeId} by user: ${userId}`);
    return updated;
  }

  async getPublicSettings(storeId: string): Promise<Partial<StoreSettingsDocument>> {
    const settings = await this.findByStoreId(storeId);

    // Return only public-facing settings
    return {
      businessHours: settings.businessHours,
      shippingZones: settings.shippingZones,
      defaultShippingFee: settings.defaultShippingFee,
      freeShippingThreshold: settings.freeShippingThreshold,
      paymentMethods: settings.paymentMethods.filter(pm => pm.isEnabled),
      minOrderAmount: settings.minOrderAmount,
      maxOrderAmount: settings.maxOrderAmount,
      allowCashOnDelivery: settings.allowCashOnDelivery,
      returnPeriod: settings.returnPeriod,
      allowReturns: settings.allowReturns,
      returnPolicy: settings.returnPolicy,
      refundPolicy: settings.refundPolicy,
      termsAndConditions: settings.termsAndConditions,
      privacyPolicy: settings.privacyPolicy,
      shippingPolicy: settings.shippingPolicy,
      taxRate: settings.taxRate,
      includeTaxInPrice: settings.includeTaxInPrice,
      enablePointsSystem: settings.enablePointsSystem,
      pointsPerCurrency: settings.pointsPerCurrency,
      pointsRedemptionRate: settings.pointsRedemptionRate,
      facebookUrl: settings.facebookUrl,
      instagramUrl: settings.instagramUrl,
      whatsappNumber: settings.whatsappNumber,
      telegramUrl: settings.telegramUrl,
      isActive: settings.isActive,
      maintenanceMode: settings.maintenanceMode,
      maintenanceMessage: settings.maintenanceMessage,
    };
  }

  async isStoreOpen(storeId: string): Promise<boolean> {
    const settings = await this.findByStoreId(storeId);

    if (!settings.isActive || settings.maintenanceMode) {
      return false;
    }

    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // 'HH:MM'

    const todayHours = settings.businessHours.find(bh => bh.day === dayName);

    if (!todayHours || !todayHours.isOpen) {
      return false;
    }

    if (todayHours.openTime && todayHours.closeTime) {
      return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
    }

    return true;
  }

  async getShippingFee(storeId: string, city: string): Promise<number> {
    const settings = await this.findByStoreId(storeId);

    // Find shipping zone for the city
    const zone = settings.shippingZones.find(z =>
      z.cities.some(c => c.toLowerCase() === city.toLowerCase()),
    );

    return zone ? zone.shippingFee : settings.defaultShippingFee;
  }

  async calculateShippingFee(storeId: string, city: string, orderTotal: number): Promise<number> {
    const settings = await this.getOrCreate(storeId);

    // Find shipping zone for the city
    const zone = settings.shippingZones.find(z =>
      z.cities.some(c => c.toLowerCase() === city.toLowerCase()),
    );

    let shippingFee = zone ? zone.shippingFee : settings.defaultShippingFee;

    // Check for free shipping threshold
    const freeShippingThreshold = zone?.freeShippingThreshold || settings.freeShippingThreshold;

    if (freeShippingThreshold > 0 && orderTotal >= freeShippingThreshold) {
      shippingFee = 0;
    }

    return shippingFee;
  }
}

