import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
} from '../../../../database/schemas/order.schema';
import { CourierProfileService } from './courier-profile.service';

/**
 * Service for managing courier earnings
 * Handles earnings calculations and summaries
 */
@Injectable()
export class CourierEarningsService {
  private readonly logger = new Logger(CourierEarningsService.name);

  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private courierProfileService: CourierProfileService,
  ) {}

  /**
   * Get courier's earnings summary
   */
  async getEarningsSummary(accountId: string): Promise<any> {
    const profile =
      await this.courierProfileService.getProfileByAccountId(accountId);

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
      (order) =>
        order.actualDeliveryTime && order.actualDeliveryTime >= todayStart,
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
   * Get earnings for a specific period
   */
  async getEarningsForPeriod(
    accountId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    const profile =
      await this.courierProfileService.getProfileByAccountId(accountId);

    const orders = await this.orderModel
      .find({
        courierId: profile._id as Types.ObjectId,
        orderStatus: OrderStatus.DELIVERED,
        actualDeliveryTime: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .exec();

    const earnings = orders.reduce((sum, order) => {
      const commission = (order.deliveryFee * profile.commissionRate) / 100;
      return sum + commission;
    }, 0);

    return {
      period: {
        start: startDate,
        end: endDate,
      },
      totalDeliveries: orders.length,
      totalEarnings: earnings,
      averagePerDelivery: orders.length > 0 ? earnings / orders.length : 0,
    };
  }
}
