import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
} from '../../../../database/schemas/order.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class OrderRepository extends BaseRepository<OrderDocument> {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {
    super(orderModel);
  }

  /**
   * Find orders by customer ID
   */
  async findByCustomerId(
    customerId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
    },
  ): Promise<{ data: OrderDocument[]; total: number }> {
    const filter: any = { customerId: new Types.ObjectId(customerId) };

    if (options?.status) {
      filter.status = options.status;
    }

    return this.findWithPagination(
      filter,
      options?.page || 1,
      options?.limit || 10,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find orders by store ID
   */
  async findByStoreId(
    storeId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
    },
  ): Promise<{ data: OrderDocument[]; total: number }> {
    const filter: any = { storeId: new Types.ObjectId(storeId) };

    if (options?.status) {
      filter.status = options.status;
    }

    return this.findWithPagination(
      filter,
      options?.page || 1,
      options?.limit || 10,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderDocument | null> {
    return this.findOne({ orderNumber });
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    status: string,
    statusHistory?: any,
  ): Promise<OrderDocument | null> {
    const updateData: any = { status };

    if (statusHistory) {
      updateData.$push = { statusHistory };
    }

    return this.orderModel
      .findByIdAndUpdate(orderId, updateData, { new: true })
      .exec();
  }

  /**
   * Assign courier to order
   */
  async assignCourier(
    orderId: string,
    courierId: string,
  ): Promise<OrderDocument | null> {
    return this.findByIdAndUpdate(orderId, {
      courierId: new Types.ObjectId(courierId),
      status: 'assigned_to_courier',
    });
  }

  /**
   * Get orders by status
   */
  async findByStatus(
    status: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: OrderDocument[]; total: number }> {
    return this.findWithPagination({ status }, page, limit, {
      sort: { createdAt: -1 },
    });
  }

  /**
   * Get pending orders for a store
   */
  async getPendingOrders(storeId: string): Promise<OrderDocument[]> {
    return this.orderModel
      .find({
        storeId: new Types.ObjectId(storeId),
        status: 'pending',
      })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get orders by courier ID
   */
  async findByCourierId(
    courierId: string,
    options?: {
      page?: number;
      limit?: number;
      status?: string;
    },
  ): Promise<{ data: OrderDocument[]; total: number }> {
    const filter: any = { courierId: new Types.ObjectId(courierId) };

    if (options?.status) {
      filter.status = options.status;
    }

    return this.findWithPagination(
      filter,
      options?.page || 1,
      options?.limit || 10,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Get order statistics for a store
   */
  async getStoreOrderStats(storeId: string): Promise<any> {
    return this.orderModel.aggregate([
      { $match: { storeId: new Types.ObjectId(storeId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
        },
      },
    ]);
  }

  /**
   * Get order statistics for a customer
   */
  async getCustomerOrderStats(customerId: string): Promise<any> {
    return this.orderModel.aggregate([
      { $match: { customerId: new Types.ObjectId(customerId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
        },
      },
    ]);
  }

  /**
   * Get orders within date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: {
      storeId?: string;
      customerId?: string;
      page?: number;
      limit?: number;
    },
  ): Promise<{ data: OrderDocument[]; total: number }> {
    const filter: any = {
      createdAt: { $gte: startDate, $lte: endDate },
    };

    if (options?.storeId) {
      filter.storeId = new Types.ObjectId(options.storeId);
    }

    if (options?.customerId) {
      filter.customerId = new Types.ObjectId(options.customerId);
    }

    return this.findWithPagination(
      filter,
      options?.page || 1,
      options?.limit || 10,
      { sort: { createdAt: -1 } },
    );
  }
}
