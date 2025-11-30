import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../base/base.repository';
import {
  CommissionConfig,
  CommissionConfigDocument,
  ConfigEntityType,
} from '../../../../database/schemas/commission-config.schema';

@Injectable()
export class CommissionConfigRepository extends BaseRepository<CommissionConfigDocument> {
  constructor(
    @InjectModel(CommissionConfig.name)
    private readonly configModel: Model<CommissionConfigDocument>,
  ) {
    super(configModel);
  }

  /**
   * Get global config
   */
  async getGlobalConfig(): Promise<CommissionConfigDocument | null> {
    return this.configModel
      .findOne({
        entityType: ConfigEntityType.GLOBAL,
        isActive: true,
      })
      .sort({ priority: -1 })
      .exec();
  }

  /**
   * Get config by store category
   */
  async getByStoreCategory(
    categoryId: string,
  ): Promise<CommissionConfigDocument | null> {
    const now = new Date();
    return this.configModel
      .findOne({
        entityType: ConfigEntityType.STORE_CATEGORY,
        entityId: new Types.ObjectId(categoryId),
        isActive: true,
        $and: [
          {
            $or: [
              { validFrom: { $exists: false } },
              { validFrom: { $lte: now } },
            ],
          },
          {
            $or: [
              { validUntil: { $exists: false } },
              { validUntil: { $gte: now } },
            ],
          },
        ],
      })
      .sort({ priority: -1 })
      .exec();
  }

  /**
   * Get config by store
   */
  async getByStore(
    storeAccountId: string,
  ): Promise<CommissionConfigDocument | null> {
    const now = new Date();
    return this.configModel
      .findOne({
        entityType: ConfigEntityType.STORE,
        entityId: new Types.ObjectId(storeAccountId),
        isActive: true,
        $and: [
          {
            $or: [
              { validFrom: { $exists: false } },
              { validFrom: { $lte: now } },
            ],
          },
          {
            $or: [
              { validUntil: { $exists: false } },
              { validUntil: { $gte: now } },
            ],
          },
        ],
      })
      .sort({ priority: -1 })
      .exec();
  }

  /**
   * Get applicable config for a store (with priority)
   * Priority: Store > Store Category > Global
   */
  async getApplicableConfig(
    storeAccountId: string,
    storeCategoryId?: string,
  ): Promise<CommissionConfigDocument | null> {
    // Check store-specific config first
    const storeConfig = await this.getByStore(storeAccountId);
    if (storeConfig) return storeConfig;

    // Check store category config
    if (storeCategoryId) {
      const categoryConfig = await this.getByStoreCategory(storeCategoryId);
      if (categoryConfig) return categoryConfig;
    }

    // Fall back to global config
    return this.getGlobalConfig();
  }

  /**
   * Get all active configs
   */
  async getAllActive(): Promise<CommissionConfigDocument[]> {
    return this.configModel
      .find({ isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .exec();
  }

  /**
   * Create or update global config
   */
  async upsertGlobalConfig(
    data: Partial<CommissionConfig>,
  ): Promise<CommissionConfigDocument> {
    return this.configModel
      .findOneAndUpdate(
        { entityType: ConfigEntityType.GLOBAL },
        { $set: { ...data, entityType: ConfigEntityType.GLOBAL } },
        { new: true, upsert: true },
      )
      .exec() as Promise<CommissionConfigDocument>;
  }
}
