import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CourierProfile,
  CourierProfileDocument,
} from '../../../../database/schemas/courier-profile.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Service for courier suspension and commission management
 */
@Injectable()
export class CourierSuspensionService {
  private readonly logger = new Logger(CourierSuspensionService.name);

  constructor(
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async suspendCourier(
    courierId: string,
    suspendedBy: string,
    reason: string,
  ): Promise<CourierProfileDocument> {
    const courier = await this.courierProfileModel.findById(courierId).exec();
    if (!courier) throw new NotFoundException('Courier not found');

    courier.isCourierSuspended = true;
    courier.courierSuspendedAt = new Date();
    courier.courierSuspendedBy = new Types.ObjectId(suspendedBy);
    courier.courierSuspensionReason = reason;
    courier.status = 'offline';
    courier.isAvailableForDelivery = false;
    await courier.save();

    this.logger.log(
      `Courier ${courierId} suspended by ${suspendedBy}: ${reason}`,
    );
    this.eventEmitter.emit('courier.suspended', {
      courierId,
      suspendedBy,
      reason,
    });

    return courier;
  }

  async unsuspendCourier(courierId: string): Promise<CourierProfileDocument> {
    const courier = await this.courierProfileModel.findById(courierId).exec();
    if (!courier) throw new NotFoundException('Courier not found');

    courier.isCourierSuspended = false;
    courier.courierSuspendedAt = undefined;
    courier.courierSuspendedBy = undefined;
    courier.courierSuspensionReason = undefined;
    courier.isAvailableForDelivery = true;
    await courier.save();

    this.logger.log(`Courier ${courierId} unsuspended`);
    this.eventEmitter.emit('courier.unsuspended', { courierId });

    return courier;
  }

  async updateCommissionRate(
    courierId: string,
    commissionRate: number,
  ): Promise<CourierProfileDocument> {
    const courier = await this.courierProfileModel.findById(courierId).exec();
    if (!courier) throw new NotFoundException('Courier not found');

    if (commissionRate < 0 || commissionRate > 100) {
      throw new BadRequestException(
        'Commission rate must be between 0 and 100',
      );
    }

    courier.commissionRate = commissionRate;
    await courier.save();

    this.logger.log(
      `Courier ${courierId} commission rate updated to ${commissionRate}%`,
    );

    return courier;
  }
}
