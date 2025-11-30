import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
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
import { CourierProfileService } from './courier-profile.service';

/**
 * Courier Delivery Assignment Service
 * Handles order acceptance and rejection by couriers
 */
@Injectable()
export class CourierDeliveryAssignmentService {
  private readonly logger = new Logger(CourierDeliveryAssignmentService.name);

  constructor(
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
    private courierProfileService: CourierProfileService,
  ) {}

  async acceptOrder(
    accountId: string,
    orderId: string,
    notes?: string,
  ): Promise<OrderDocument> {
    const profile =
      await this.courierProfileService.getProfileByAccountId(accountId);
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      !order.courierId ||
      order.courierId.toString() !== (profile._id as Types.ObjectId).toString()
    ) {
      throw new UnauthorizedException('This order is not assigned to you');
    }

    if (order.orderStatus !== OrderStatus.READY) {
      throw new BadRequestException('Order is not ready for pickup');
    }

    // Update courier status to busy
    profile.status = 'busy';
    profile.activeDeliveries.push(order._id as Types.ObjectId);
    await profile.save();

    this.logger.log(`Courier ${accountId} accepted order ${orderId}`);

    this.eventEmitter.emit('courier.order.accepted', {
      courierId: (profile._id as Types.ObjectId).toString(),
      orderId,
      notes,
    });

    return order;
  }

  async rejectOrder(
    accountId: string,
    orderId: string,
    reason: string,
  ): Promise<void> {
    const profile =
      await this.courierProfileService.getProfileByAccountId(accountId);
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      !order.courierId ||
      order.courierId.toString() !== (profile._id as Types.ObjectId).toString()
    ) {
      throw new UnauthorizedException('This order is not assigned to you');
    }

    // Remove courier assignment
    order.courierId = undefined;
    await order.save();

    this.logger.log(
      `Courier ${accountId} rejected order ${orderId}: ${reason}`,
    );

    this.eventEmitter.emit('courier.order.rejected', {
      courierId: (profile._id as Types.ObjectId).toString(),
      orderId,
      reason,
    });
  }
}
