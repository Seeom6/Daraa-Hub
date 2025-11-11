import { Injectable, Logger, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourierProfile, CourierProfileDocument } from '../../../../database/schemas/courier-profile.schema';
import { Order, OrderDocument, OrderStatus } from '../../../../database/schemas/order.schema';
import { Payment, PaymentDocument } from '../../../../database/schemas/payment.schema';
import { UpdateCourierProfileDto, UpdateCourierStatusDto, UpdateLocationDto, UpdateDeliveryStatusDto } from '../dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentService } from '../../../e-commerce/payment/services/payment.service';

@Injectable()
export class CourierService {
  private readonly logger = new Logger(CourierService.name);

  constructor(
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    private eventEmitter: EventEmitter2,
    private paymentService: PaymentService,
  ) {}

  /**
   * Get courier profile by account ID
   */
  async getProfileByAccountId(accountId: string): Promise<CourierProfileDocument> {
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

    this.logger.log(`Courier status updated to ${updateDto.status} for account: ${accountId}`);

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
   * Get courier's active deliveries
   */
  async getActiveDeliveries(accountId: string): Promise<OrderDocument[]> {
    const profile = await this.getProfileByAccountId(accountId);

    const orders = await this.orderModel
      .find({
        courierId: profile._id as Types.ObjectId,
        orderStatus: { $in: [OrderStatus.PICKED_UP, OrderStatus.DELIVERING] },
      })
      .populate('customerId', 'fullName phoneNumber')
      .populate('storeId', 'storeName phoneNumber')
      .sort({ createdAt: -1 })
      .exec();

    return orders;
  }

  /**
   * Get courier's delivery history
   */
  async getDeliveryHistory(
    accountId: string,
    limit: number = 50,
  ): Promise<OrderDocument[]> {
    const profile = await this.getProfileByAccountId(accountId);

    const orders = await this.orderModel
      .find({
        courierId: profile._id as Types.ObjectId,
        orderStatus: { $in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
      })
      .populate('customerId', 'fullName phoneNumber')
      .populate('storeId', 'storeName phoneNumber')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return orders;
  }

  /**
   * Get courier's earnings summary
   */
  async getEarningsSummary(accountId: string): Promise<any> {
    const profile = await this.getProfileByAccountId(accountId);

    const deliveredOrders = await this.orderModel
      .find({
        courierId: profile._id as Types.ObjectId,
        orderStatus: OrderStatus.DELIVERED,
      })
      .exec();

    const totalEarnings = deliveredOrders.reduce((sum, order) => {
      const commission = (order.deliveryFee * profile.commissionRate) / 100;
      return sum + commission;
    }, 0);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayOrders = deliveredOrders.filter(
      (order) => order.actualDeliveryTime && order.actualDeliveryTime >= todayStart,
    );

    const todayEarnings = todayOrders.reduce((sum, order) => {
      const commission = (order.deliveryFee * profile.commissionRate) / 100;
      return sum + commission;
    }, 0);

    return {
      totalEarnings,
      todayEarnings,
      totalDeliveries: profile.totalDeliveries,
      todayDeliveries: todayOrders.length,
      commissionRate: profile.commissionRate,
      rating: profile.rating,
      totalReviews: profile.totalReviews,
    };
  }

  /**
   * Accept assigned order
   */
  async acceptOrder(accountId: string, orderId: string, notes?: string): Promise<OrderDocument> {
    const profile = await this.getProfileByAccountId(accountId);
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.courierId || order.courierId.toString() !== (profile._id as Types.ObjectId).toString()) {
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

    // Emit event
    this.eventEmitter.emit('courier.order.accepted', {
      courierId: (profile._id as Types.ObjectId).toString(),
      orderId,
      notes,
    });

    return order;
  }

  /**
   * Reject assigned order
   */
  async rejectOrder(accountId: string, orderId: string, reason: string): Promise<void> {
    const profile = await this.getProfileByAccountId(accountId);
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.courierId || order.courierId.toString() !== (profile._id as Types.ObjectId).toString()) {
      throw new UnauthorizedException('This order is not assigned to you');
    }

    // Remove courier assignment
    order.courierId = undefined;
    await order.save();

    this.logger.log(`Courier ${accountId} rejected order ${orderId}: ${reason}`);

    // Emit event
    this.eventEmitter.emit('courier.order.rejected', {
      courierId: (profile._id as Types.ObjectId).toString(),
      orderId,
      reason,
    });
  }

  /**
   * Update delivery status
   */
  async updateDeliveryStatus(
    accountId: string,
    orderId: string,
    updateDto: UpdateDeliveryStatusDto,
  ): Promise<OrderDocument> {
    const profile = await this.getProfileByAccountId(accountId);
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.courierId || order.courierId.toString() !== (profile._id as Types.ObjectId).toString()) {
      throw new UnauthorizedException('This order is not assigned to you');
    }

    // Update order status
    order.orderStatus = updateDto.status as any;

    if (updateDto.status === 'delivered') {
      order.actualDeliveryTime = new Date();

      // Update courier profile
      profile.totalDeliveries += 1;
      profile.totalEarnings += (order.deliveryFee * profile.commissionRate) / 100;
      profile.activeDeliveries = profile.activeDeliveries.filter(
        (id) => id.toString() !== orderId,
      );
      profile.deliveries.push(order._id as Types.ObjectId);

      // If no more active deliveries, set status to available
      if (profile.activeDeliveries.length === 0) {
        profile.status = 'available';
      }

      await profile.save();
    }

    await order.save();

    this.logger.log(`Order ${orderId} status updated to ${updateDto.status} by courier ${accountId}`);

    // If order is delivered and payment is cash, confirm payment immediately
    if (updateDto.status === 'delivered') {
      const payment = await this.paymentModel.findOne({ orderId: new Types.ObjectId(orderId) }).exec();
      if (payment && payment.paymentMethod === 'cash' && payment.status === 'pending') {
        this.logger.log(`Auto-confirming cash payment for delivered order ${orderId}`);
        try {
          await this.paymentService.confirmCashPaymentByOrderId(
            orderId,
            (profile._id as Types.ObjectId).toString(),
          );
          this.logger.log(`Cash payment confirmed for order ${orderId}`);
        } catch (error) {
          this.logger.error(`Failed to confirm cash payment for order ${orderId}:`, error);
        }
      }
    }

    // Emit event
    this.eventEmitter.emit('delivery.status.updated', {
      courierId: (profile._id as Types.ObjectId).toString(),
      orderId,
      status: updateDto.status,
      proofOfDelivery: updateDto.proofOfDelivery,
    });

    return order;
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

