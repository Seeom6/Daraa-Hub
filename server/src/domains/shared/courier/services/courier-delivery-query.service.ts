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
 * Courier Delivery Query Service
 * Handles delivery history and active deliveries queries
 */
@Injectable()
export class CourierDeliveryQueryService {
  private readonly logger = new Logger(CourierDeliveryQueryService.name);

  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    private courierProfileService: CourierProfileService,
  ) {}

  async getActiveDeliveries(accountId: string): Promise<OrderDocument[]> {
    const profile =
      await this.courierProfileService.getProfileByAccountId(accountId);

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

  async getDeliveryHistory(
    accountId: string,
    limit: number = 50,
  ): Promise<OrderDocument[]> {
    const profile =
      await this.courierProfileService.getProfileByAccountId(accountId);

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
}
