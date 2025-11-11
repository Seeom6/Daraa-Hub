import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SystemSettings,
  SystemSettingsDocument,
} from '../../../../database/schemas/system-settings.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class SystemSettingsRepository extends BaseRepository<SystemSettingsDocument> {
  constructor(
    @InjectModel(SystemSettings.name)
    private readonly systemSettingsModel: Model<SystemSettingsDocument>,
  ) {
    super(systemSettingsModel);
  }

  /**
   * Get system settings (singleton)
   */
  async getSettings(): Promise<SystemSettingsDocument | null> {
    let settings = await this.systemSettingsModel.findOne().exec();

    if (!settings) {
      // Create default settings if not exists
      const newSettings = new this.systemSettingsModel({});
      settings = await newSettings.save();
    }

    return settings;
  }

  /**
   * Update system settings
   */
  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettingsDocument | null> {
    const settings = await this.getSettings();
    if (!settings) return null;

    return this.findByIdAndUpdate((settings as any)._id.toString(), data);
  }

  /**
   * Get setting by key
   */
  async getSetting(key: string): Promise<any> {
    const settings = await this.getSettings();
    return settings ? (settings as any)[key] : null;
  }

  /**
   * Update setting by key
   */
  async updateSetting(key: string, value: any): Promise<SystemSettingsDocument | null> {
    const settings = await this.getSettings();
    if (!settings) return null;

    return this.findByIdAndUpdate((settings as any)._id.toString(), { [key]: value });
  }
}

