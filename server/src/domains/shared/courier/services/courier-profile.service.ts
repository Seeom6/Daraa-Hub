import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CourierProfile,
  CourierProfileDocument,
} from '../../../../database/schemas/courier-profile.schema';
import {
  UpdateCourierProfileDto,
  UpdateCourierStatusDto,
  UpdateLocationDto,
} from '../dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Service for managing courier profiles
 * Handles profile CRUD, status updates, and location tracking
 */
@Injectable()
export class CourierProfileService {
  private readonly logger = new Logger(CourierProfileService.name);

  constructor(
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get courier profile by account ID
   */
  async getProfileByAccountId(
    accountId: string,
  ): Promise<CourierProfileDocument> {
    const profile = await this.courierProfileModel
      .findOne({ accountId: new Types.ObjectId(accountId) })
      .exec();

    if (!profile) {
      throw new NotFoundException('Courier profile not found');
    }

    return profile;
  }

  /**
   * Get courier profile by courier ID
   */
  async getProfileById(courierId: string): Promise<CourierProfileDocument> {
    const profile = await this.courierProfileModel.findById(courierId).exec();

    if (!profile) {
      throw new NotFoundException('Courier profile not found');
    }

    return profile;
  }

  /**
   * Update courier profile
   */
  async updateProfile(
    accountId: string,
    updateDto: UpdateCourierProfileDto,
  ): Promise<CourierProfileDocument> {
    const profile = await this.getProfileByAccountId(accountId);

    Object.assign(profile, updateDto);
    await profile.save();

    this.logger.log(`Courier profile updated for account: ${accountId}`);
    return profile;
  }

  /**
   * Update courier status (online/offline/busy/on_break)
   */
  async updateStatus(
    accountId: string,
    updateDto: UpdateCourierStatusDto,
  ): Promise<CourierProfileDocument> {
    const profile = await this.getProfileByAccountId(accountId);

    profile.status = updateDto.status;
    await profile.save();

    this.logger.log(
      `Courier status updated to ${updateDto.status} for account: ${accountId}`,
    );

    // Emit event for status change
    this.eventEmitter.emit('courier.status.changed', {
      courierId: (profile._id as Types.ObjectId).toString(),
      accountId,
      status: updateDto.status,
    });

    return profile;
  }

  /**
   * Update courier location
   */
  async updateLocation(
    accountId: string,
    updateDto: UpdateLocationDto,
  ): Promise<CourierProfileDocument> {
    const profile = await this.getProfileByAccountId(accountId);

    profile.currentLocation = {
      type: 'Point',
      coordinates: updateDto.coordinates,
    };
    await profile.save();

    this.logger.log(`Courier location updated for account: ${accountId}`);

    // Emit event for location update
    this.eventEmitter.emit('courier.location.updated', {
      courierId: (profile._id as Types.ObjectId).toString(),
      accountId,
      location: profile.currentLocation,
    });

    return profile;
  }

  /**
   * Find available couriers near a location
   */
  async findAvailableCouriers(
    longitude: number,
    latitude: number,
    maxDistance: number = 10000, // 10km default
  ): Promise<CourierProfileDocument[]> {
    const couriers = await this.courierProfileModel
      .find({
        status: 'available',
        isAvailableForDelivery: true,
        isCourierSuspended: false,
        verificationStatus: 'approved',
        currentLocation: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            $maxDistance: maxDistance,
          },
        },
      })
      .limit(10)
      .exec();

    return couriers;
  }
}
