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
import {
  Order,
  OrderDocument,
  OrderStatus,
} from '../../../../database/schemas/order.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

/**
 * Service for courier order assignment operations
 */
@Injectable()
export class CourierAssignmentService {
  private readonly logger = new Logger(CourierAssignmentService.name);

  constructor(
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async assignOrderToCourier(
    orderId: string,
    courierId: string,
    assignedBy: string,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Order not found');

    if (order.orderStatus !== OrderStatus.READY) {
      throw new BadRequestException(
        'Order must be in READY status to assign to courier',
      );
    }

    const courier = await this.courierProfileModel.findById(courierId).exec();
    if (!courier) throw new NotFoundException('Courier not found');
    if (courier.isCourierSuspended)
      throw new BadRequestException('Courier is suspended');
    if (courier.verificationStatus !== 'approved') {
      throw new BadRequestException('Courier is not verified');
    }

    order.courierId = new Types.ObjectId(courierId);
    await order.save();

    this.logger.log(
      `Order ${orderId} assigned to courier ${courierId} by ${assignedBy}`,
    );
    this.eventEmitter.emit('order.assigned.to.courier', {
      orderId,
      courierId,
      assignedBy,
    });

    return order;
  }

  async findAvailableCouriersForOrder(
    orderId: string,
  ): Promise<CourierProfileDocument[]> {
    const order = await this.orderModel.findById(orderId).exec();
    if (!order) throw new NotFoundException('Order not found');

    const location = order.deliveryAddress.location;

    if (!location || !location.coordinates) {
      return this.courierProfileModel
        .find({
          status: 'available',
          isAvailableForDelivery: true,
          isCourierSuspended: false,
          verificationStatus: 'approved',
        })
        .populate('accountId', 'fullName phoneNumber')
        .limit(10)
        .exec();
    }

    return this.courierProfileModel
      .find({
        status: 'available',
        isAvailableForDelivery: true,
        isCourierSuspended: false,
        verificationStatus: 'approved',
        currentLocation: {
          $near: {
            $geometry: { type: 'Point', coordinates: location.coordinates },
            $maxDistance: 10000,
          },
        },
      })
      .populate('accountId', 'fullName phoneNumber')
      .limit(10)
      .exec();
  }
}
