import { Injectable, Logger, NotFoundException } from '@nestjs/common';
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

/**
 * Service for courier statistics and queries
 */
@Injectable()
export class CourierStatsService {
  private readonly logger = new Logger(CourierStatsService.name);

  constructor(
    @InjectModel(CourierProfile.name)
    private courierProfileModel: Model<CourierProfileDocument>,
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
  ) {}

  async getAllCouriers(filters: {
    status?: string;
    verificationStatus?: string;
    limit?: number;
  }): Promise<CourierProfileDocument[]> {
    const query: any = {};
    if (filters.status) query.status = filters.status;
    if (filters.verificationStatus)
      query.verificationStatus = filters.verificationStatus;

    return this.courierProfileModel
      .find(query)
      .populate('accountId', 'fullName phoneNumber email')
      .sort({ createdAt: -1 })
      .limit(filters.limit || 50)
      .exec();
  }

  async getCourierStatistics(courierId: string): Promise<any> {
    const courier = await this.courierProfileModel.findById(courierId).exec();
    if (!courier) throw new NotFoundException('Courier not found');

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

    const deliveryTimes = deliveredOrders
      .filter((order) => order.actualDeliveryTime && order.createdAt)
      .map((order) => {
        const created = new Date(order.createdAt).getTime();
        const delivered = new Date(order.actualDeliveryTime!).getTime();
        return (delivered - created) / (1000 * 60);
      });

    const avgDeliveryTime =
      deliveryTimes.length > 0
        ? deliveryTimes.reduce((sum, time) => sum + time, 0) /
          deliveryTimes.length
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
