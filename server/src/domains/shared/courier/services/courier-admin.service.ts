import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CourierProfile, CourierProfileDocument } from '../../../../database/schemas/courier-profile.schema';
import { Order, OrderDocument, OrderStatus } from '../../../../database/schemas/order.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CourierAdminService {
  private readonly logger = new Logger(CourierAdminService.name);

  constructor(
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Get all couriers with filters
   */
  async getAllCouriers(filters: {
    status?: string;
    verificationStatus?: string;
    limit?: number;
  }): Promise<CourierProfileDocument[]> {
    const query: any = {};

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.verificationStatus) {
      query.verificationStatus = filters.verificationStatus;
    }

    const couriers = await this.courierProfileModel
      .find(query)
      .populate('accountId', 'fullName phoneNumber email')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .exec();

    return couriers;
  }

  /**
   * Assign order to courier
   */
  async assignOrderToCourier(
    orderId: string,
    courierId: string,
    assignedBy: string,
  ): Promise<OrderDocument> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.orderStatus !== OrderStatus.READY) {
      throw new BadRequestException('Order must be in READY status to assign to courier');
    }

    const courier = await this.courierProfileModel.findById(courierId).exec();

    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    if (courier.isCourierSuspended) {
      throw new BadRequestException('Courier is suspended');
    }

    if (courier.verificationStatus !== 'approved') {
      throw new BadRequestException('Courier is not verified');
    }

    // Assign courier to order
    order.courierId = new Types.ObjectId(courierId);
    await order.save();

    this.logger.log(`Order ${orderId} assigned to courier ${courierId} by ${assignedBy}`);

    // Emit event
    this.eventEmitter.emit('order.assigned.to.courier', {
      orderId,
      courierId,
      assignedBy,
    });

    return order;
  }

  /**
   * Find available couriers for an order
   */
  async findAvailableCouriersForOrder(orderId: string): Promise<CourierProfileDocument[]> {
    const order = await this.orderModel.findById(orderId).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Get delivery address location
    const location = order.deliveryAddress.location;

    if (!location || !location.coordinates) {
      // If no location, return all available couriers
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

    // Find couriers near the delivery location
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
              coordinates: location.coordinates,
            },
            $maxDistance: 10000, // 10km
          },
        },
      })
      .populate('accountId', 'fullName phoneNumber')
      .limit(10)
      .exec();

    return couriers;
  }

  /**
   * Suspend courier
   */
  async suspendCourier(
    courierId: string,
    suspendedBy: string,
    reason: string,
  ): Promise<CourierProfileDocument> {
    const courier = await this.courierProfileModel.findById(courierId).exec();

    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    courier.isCourierSuspended = true;
    courier.courierSuspendedAt = new Date();
    courier.courierSuspendedBy = new Types.ObjectId(suspendedBy);
    courier.courierSuspensionReason = reason;
    courier.status = 'offline';
    courier.isAvailableForDelivery = false;
    await courier.save();

    this.logger.log(`Courier ${courierId} suspended by ${suspendedBy}: ${reason}`);

    // Emit event
    this.eventEmitter.emit('courier.suspended', {
      courierId,
      suspendedBy,
      reason,
    });

    return courier;
  }

  /**
   * Unsuspend courier
   */
  async unsuspendCourier(courierId: string): Promise<CourierProfileDocument> {
    const courier = await this.courierProfileModel.findById(courierId).exec();

    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    courier.isCourierSuspended = false;
    courier.courierSuspendedAt = undefined;
    courier.courierSuspendedBy = undefined;
    courier.courierSuspensionReason = undefined;
    courier.isAvailableForDelivery = true;
    await courier.save();

    this.logger.log(`Courier ${courierId} unsuspended`);

    // Emit event
    this.eventEmitter.emit('courier.unsuspended', {
      courierId,
    });

    return courier;
  }

  /**
   * Update courier commission rate
   */
  async updateCommissionRate(
    courierId: string,
    commissionRate: number,
  ): Promise<CourierProfileDocument> {
    const courier = await this.courierProfileModel.findById(courierId).exec();

    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    if (commissionRate < 0 || commissionRate > 100) {
      throw new BadRequestException('Commission rate must be between 0 and 100');
    }

    courier.commissionRate = commissionRate;
    await courier.save();

    this.logger.log(`Courier ${courierId} commission rate updated to ${commissionRate}%`);

    return courier;
  }

  /**
   * Get courier statistics
   */
  async getCourierStatistics(courierId: string): Promise<any> {
    const courier = await this.courierProfileModel.findById(courierId).exec();

    if (!courier) {
      throw new NotFoundException('Courier not found');
    }

    const deliveredOrders = await this.orderModel
      .find({
        courierId: new Types.ObjectId(courierId),
        orderStatus: OrderStatus.DELIVERED,
      })
      .exec();

    const totalEarnings = deliveredOrders.reduce((sum, order) => {
      const commission = (order.deliveryFee * courier.commissionRate) / 100;
      return sum + commission;
    }, 0);

    const totalDeliveryFees = deliveredOrders.reduce(
      (sum, order) => sum + order.deliveryFee,
      0,
    );

    // Calculate average delivery time
    const deliveryTimes = deliveredOrders
      .filter((order) => order.actualDeliveryTime && order.createdAt)
      .map((order) => {
        const created = new Date(order.createdAt).getTime();
        const delivered = new Date(order.actualDeliveryTime!).getTime();
        return (delivered - created) / (1000 * 60); // minutes
      });

    const avgDeliveryTime =
      deliveryTimes.length > 0
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) / deliveryTimes.length
        : 0;

    return {
      totalDeliveries: courier.totalDeliveries,
      totalEarnings,
      totalDeliveryFees,
      commissionRate: courier.commissionRate,
      rating: courier.rating,
      totalReviews: courier.totalReviews,
      avgDeliveryTime: Math.round(avgDeliveryTime),
      activeDeliveries: courier.activeDeliveries.length,
      status: courier.status,
      verificationStatus: courier.verificationStatus,
      isSuspended: courier.isCourierSuspended,
    };
  }
}

