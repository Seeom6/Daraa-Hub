import {
  Injectable,
  Logger,
  NotFoundException,
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
import {
  Payment,
  PaymentDocument,
} from '../../../../database/schemas/payment.schema';
import { UpdateDeliveryStatusDto } from '../dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentService } from '../../../e-commerce/payment/services/payment.service';
import { CourierProfileService } from './courier-profile.service';

/**
 * Courier Delivery Tracking Service
 * Handles delivery status updates and tracking
 */
@Injectable()
export class CourierDeliveryTrackingService {
  private readonly logger = new Logger(CourierDeliveryTrackingService.name);

  constructor(
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    private eventEmitter: EventEmitter2,
    private paymentService: PaymentService,
    private courierProfileService: CourierProfileService,
  ) {}

  async updateDeliveryStatus(
    accountId: string,
    orderId: string,
    updateDto: UpdateDeliveryStatusDto,
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

    order.orderStatus = updateDto.status as any;

    if (updateDto.status === 'delivered') {
      order.actualDeliveryTime = new Date();

      profile.totalDeliveries += 1;
      profile.totalEarnings +=
        (order.deliveryFee * profile.commissionRate) / 100;
      profile.activeDeliveries = profile.activeDeliveries.filter(
        (id) => id.toString() !== orderId,
      );
      profile.deliveries.push(order._id as Types.ObjectId);

      if (profile.activeDeliveries.length === 0) {
        profile.status = 'available';
      }

      await profile.save();
    }

    await order.save();

    this.logger.log(
      `Order ${orderId} status updated to ${updateDto.status} by courier ${accountId}`,
    );

    if (updateDto.status === 'delivered') {
      await this.handleCashPaymentConfirmation(orderId, profile);
    }

    this.eventEmitter.emit('delivery.status.updated', {
      courierId: (profile._id as Types.ObjectId).toString(),
      orderId,
      status: updateDto.status,
      proofOfDelivery: updateDto.proofOfDelivery,
    });

    return order;
  }

  private async handleCashPaymentConfirmation(
    orderId: string,
    profile: CourierProfileDocument,
  ): Promise<void> {
    const payment = await this.paymentModel
      .findOne({ orderId: new Types.ObjectId(orderId) })
      .exec();

    if (
      payment &&
      payment.paymentMethod === 'cash' &&
      payment.status === 'pending'
    ) {
      this.logger.log(
        `Auto-confirming cash payment for delivered order ${orderId}`,
      );
      try {
        await this.paymentService.confirmCashPaymentByOrderId(
          orderId,
          (profile._id as Types.ObjectId).toString(),
        );
        this.logger.log(`Cash payment confirmed for order ${orderId}`);
      } catch (error) {
        this.logger.error(
          `Failed to confirm cash payment for order ${orderId}:`,
          error,
        );
      }
    }
  }
}
