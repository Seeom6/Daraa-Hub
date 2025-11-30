import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Address,
  AddressDocument,
} from '../../../../database/schemas/address.schema';
import { BaseRepository } from '../../base/base.repository';

@Injectable()
export class AddressRepository extends BaseRepository<AddressDocument> {
  constructor(
    @InjectModel(Address.name)
    private readonly addressModel: Model<AddressDocument>,
  ) {
    super(addressModel);
  }

  /**
   * Find all active addresses for a customer
   */
  async findByCustomerId(customerId: string): Promise<AddressDocument[]> {
    return this.model
      .find({
        customerId: new Types.ObjectId(customerId),
        isActive: true,
      })
      .sort({ isDefault: -1, usageCount: -1, updatedAt: -1 })
      .exec();
  }

  /**
   * Find the default address for a customer
   */
  async findDefaultAddress(
    customerId: string,
  ): Promise<AddressDocument | null> {
    return this.model
      .findOne({
        customerId: new Types.ObjectId(customerId),
        isDefault: true,
        isActive: true,
      })
      .exec();
  }

  /**
   * Set address as default (and unset others)
   */
  async setAsDefault(
    customerId: string,
    addressId: string,
  ): Promise<AddressDocument | null> {
    // Unset all other defaults for this customer
    await this.model.updateMany(
      {
        customerId: new Types.ObjectId(customerId),
        _id: { $ne: new Types.ObjectId(addressId) },
      },
      { isDefault: false },
    );

    // Set the new default
    return this.model
      .findByIdAndUpdate(addressId, { isDefault: true }, { new: true })
      .exec();
  }

  /**
   * Increment usage count and update last used date
   */
  async incrementUsage(addressId: string): Promise<AddressDocument | null> {
    return this.model
      .findByIdAndUpdate(
        addressId,
        {
          $inc: { usageCount: 1 },
          lastUsedAt: new Date(),
        },
        { new: true },
      )
      .exec();
  }

  /**
   * Soft delete address (set isActive to false)
   */
  async softDelete(addressId: string): Promise<AddressDocument | null> {
    return this.model
      .findByIdAndUpdate(
        addressId,
        { isActive: false, isDefault: false },
        { new: true },
      )
      .exec();
  }

  /**
   * Find addresses near a location (for delivery zone matching)
   */
  async findNearLocation(
    longitude: number,
    latitude: number,
    maxDistanceMeters: number = 5000,
  ): Promise<AddressDocument[]> {
    return this.model
      .find({
        isActive: true,
        location: {
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

  /**
   * Count active addresses for a customer
   */
  async countByCustomerId(customerId: string): Promise<number> {
    return this.model
      .countDocuments({
        customerId: new Types.ObjectId(customerId),
        isActive: true,
      })
      .exec();
  }

  /**
   * Check if customer owns the address
   */
  async isOwnedByCustomer(
    addressId: string,
    customerId: string,
  ): Promise<boolean> {
    const count = await this.model
      .countDocuments({
        _id: new Types.ObjectId(addressId),
        customerId: new Types.ObjectId(customerId),
      })
      .exec();
    return count > 0;
  }
}
