import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  StoreSettings,
  StoreSettingsDocument,
} from '../../../../database/schemas/store-settings.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class StoreSettingsRepository extends BaseRepository<StoreSettingsDocument> {
  constructor(
    @InjectModel(StoreSettings.name)
    private readonly storeSettingsModel: Model<StoreSettingsDocument>,
  ) {
    super(storeSettingsModel);
  }

  /**
   * Find settings by store ID
   */
  async findByStoreId(storeId: string): Promise<StoreSettingsDocument | null> {
    return this.findOne({ storeId: new Types.ObjectId(storeId) });
  }

  /**
   * Get or create settings for store
   */
  async getOrCreateSettings(storeId: string): Promise<StoreSettingsDocument> {
    let settings = await this.findByStoreId(storeId);

    if (!settings) {
      settings = await this.create({
        storeId: new Types.ObjectId(storeId),
      } as any);
    }

    return settings;
  }

  /**
   * Update store settings
   */
  async updateStoreSettings(
    storeId: string,
    data: Partial<StoreSettings>,
  ): Promise<StoreSettingsDocument | null> {
    const settings = await this.getOrCreateSettings(storeId);
    return this.findByIdAndUpdate((settings as any)._id.toString(), data);
  }

  /**
   * Toggle store feature
   */
  async toggleFeature(
    storeId: string,
    feature: string,
    enabled: boolean,
  ): Promise<StoreSettingsDocument | null> {
    const settings = await this.getOrCreateSettings(storeId);
    return this.findByIdAndUpdate((settings as any)._id.toString(), {
      [feature]: enabled,
    });
  }
}
