import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseRepository } from '../../base/base.repository';
import {
  DeliveryZone,
  DeliveryZoneDocument,
  ZoneStatus,
  ZoneType,
} from '../../../../database/schemas/delivery-zone.schema';

@Injectable()
export class DeliveryZoneRepository extends BaseRepository<DeliveryZoneDocument> {
  constructor(
    @InjectModel(DeliveryZone.name)
    private readonly zoneModel: Model<DeliveryZoneDocument>,
  ) {
    super(zoneModel);
  }

  async findByName(name: string): Promise<DeliveryZoneDocument | null> {
    return this.zoneModel.findOne({ name }).exec();
  }

  async findActiveZones(type?: ZoneType): Promise<DeliveryZoneDocument[]> {
    const query: any = { status: ZoneStatus.ACTIVE };
    if (type) query.type = type;

    return this.zoneModel.find(query).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findByParent(parentZoneId: string): Promise<DeliveryZoneDocument[]> {
    return this.zoneModel
      .find({
        parentZoneId: new Types.ObjectId(parentZoneId),
        status: ZoneStatus.ACTIVE,
      })
      .sort({ sortOrder: 1 })
      .exec();
  }

  async findZoneTree(): Promise<DeliveryZoneDocument[]> {
    // Get all zones and build tree client-side for simplicity
    return this.zoneModel
      .find({ status: { $ne: ZoneStatus.INACTIVE } })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  /**
   * Find zone containing a point (using geospatial query)
   */
  async findZoneByLocation(
    longitude: number,
    latitude: number,
  ): Promise<DeliveryZoneDocument | null> {
    return this.zoneModel
      .findOne({
        status: ZoneStatus.ACTIVE,
        polygon: {
          $geoIntersects: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          },
        },
      })
      .exec();
  }

  /**
   * Find zones near a point
   */
  async findNearbyZones(
    longitude: number,
    latitude: number,
    maxDistanceMeters = 10000,
  ): Promise<DeliveryZoneDocument[]> {
    return this.zoneModel
      .find({
        status: ZoneStatus.ACTIVE,
        center: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistanceMeters,
          },
        },
      })
      .exec();
  }

  async updateStatus(
    id: string,
    status: ZoneStatus,
  ): Promise<DeliveryZoneDocument | null> {
    return this.zoneModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .exec();
  }

  async incrementStats(
    zoneId: string,
    field: 'totalOrders' | 'activeStores' | 'activeCouriers',
    increment = 1,
  ): Promise<void> {
    await this.zoneModel.updateOne(
      { _id: new Types.ObjectId(zoneId) },
      { $inc: { [field]: increment } },
    );
  }

  async getZoneStats(): Promise<{
    totalZones: number;
    activeZones: number;
    byType: { type: ZoneType; count: number }[];
  }> {
    const [totalZones, activeZones, byType] = await Promise.all([
      this.zoneModel.countDocuments(),
      this.zoneModel.countDocuments({ status: ZoneStatus.ACTIVE }),
      this.zoneModel.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } },
      ]),
    ]);

    return { totalZones, activeZones, byType };
  }
}
