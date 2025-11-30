import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../base/base.repository';
import {
  StoreDeliveryZone,
  StoreDeliveryZoneDocument,
} from '../../../../database/schemas/store-delivery-zone.schema';

@Injectable()
export class StoreDeliveryZoneRepository extends BaseRepository<StoreDeliveryZoneDocument> {
  constructor(
    @InjectModel(StoreDeliveryZone.name)
    private readonly storeZoneModel: Model<StoreDeliveryZoneDocument>,
  ) {
    super(storeZoneModel);
  }

  async findByStore(
    storeAccountId: string,
  ): Promise<StoreDeliveryZoneDocument[]> {
    return this.storeZoneModel
      .find({ storeAccountId: new Types.ObjectId(storeAccountId) })
      .populate('zoneId')
      .exec();
  }

  async findActiveByStore(
    storeAccountId: string,
  ): Promise<StoreDeliveryZoneDocument[]> {
    return this.storeZoneModel
      .find({
        storeAccountId: new Types.ObjectId(storeAccountId),
        isActive: true,
      })
      .populate('zoneId')
      .exec();
  }

  async findByZone(zoneId: string): Promise<StoreDeliveryZoneDocument[]> {
    return this.storeZoneModel
      .find({ zoneId: new Types.ObjectId(zoneId), isActive: true })
      .populate('storeAccountId')
      .exec();
  }

  async findStoreZone(
    storeAccountId: string,
    zoneId: string,
  ): Promise<StoreDeliveryZoneDocument | null> {
    return this.storeZoneModel
      .findOne({
        storeAccountId: new Types.ObjectId(storeAccountId),
        zoneId: new Types.ObjectId(zoneId),
      })
      .populate('zoneId')
      .exec();
  }

  async addStoreToZone(
    storeAccountId: string,
    zoneId: string,
    customSettings?: Partial<StoreDeliveryZone>,
  ): Promise<StoreDeliveryZoneDocument> {
    const existing = await this.findStoreZone(storeAccountId, zoneId);
    if (existing) {
      // Update existing
      return this.storeZoneModel
        .findByIdAndUpdate(
          existing._id,
          { $set: { ...customSettings, isActive: true } },
          { new: true },
        )
        .populate('zoneId')
        .exec() as Promise<StoreDeliveryZoneDocument>;
    }

    // Create new
    const doc = await this.storeZoneModel.create({
      storeAccountId: new Types.ObjectId(storeAccountId),
      zoneId: new Types.ObjectId(zoneId),
      ...customSettings,
    });

    return doc.populate('zoneId');
  }

  async removeStoreFromZone(
    storeAccountId: string,
    zoneId: string,
  ): Promise<boolean> {
    const result = await this.storeZoneModel.updateOne(
      {
        storeAccountId: new Types.ObjectId(storeAccountId),
        zoneId: new Types.ObjectId(zoneId),
      },
      { $set: { isActive: false } },
    );
    return result.modifiedCount > 0;
  }

  async updateStoreZoneSettings(
    storeAccountId: string,
    zoneId: string,
    settings: Partial<StoreDeliveryZone>,
  ): Promise<StoreDeliveryZoneDocument | null> {
    return this.storeZoneModel
      .findOneAndUpdate(
        {
          storeAccountId: new Types.ObjectId(storeAccountId),
          zoneId: new Types.ObjectId(zoneId),
        },
        { $set: settings },
        { new: true },
      )
      .populate('zoneId')
      .exec();
  }

  async getStoresCountByZone(zoneId: string): Promise<number> {
    return this.storeZoneModel.countDocuments({
      zoneId: new Types.ObjectId(zoneId),
      isActive: true,
    });
  }

  async getZonesCountByStore(storeAccountId: string): Promise<number> {
    return this.storeZoneModel.countDocuments({
      storeAccountId: new Types.ObjectId(storeAccountId),
      isActive: true,
    });
  }
}
