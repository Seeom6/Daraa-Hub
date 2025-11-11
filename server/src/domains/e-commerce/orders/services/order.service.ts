import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { OrderDocument, OrderStatus } from '../../../../database/schemas/order.schema';
import { OrderRepository } from '../repositories/order.repository';

/**
 * Core Order Service
 * Handles CRUD operations and queries for orders
 */
@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private readonly orderRepository: OrderRepository) {}

  /**
   * Get order by ID (without populate)
   */
  async findOne(orderId: string): Promise<OrderDocument> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get order by ID with populated fields (for display purposes)
   */
  async findOneWithDetails(orderId: string): Promise<OrderDocument> {
    const order = await this.orderRepository
      .getModel()
      .findById(orderId)
      .populate('customerId', 'accountId')
      .populate('storeId', 'businessName')
      .populate('courierId', 'accountId')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(
    customerId: string,
    filters: { status?: OrderStatus; page?: number; limit?: number },
  ): Promise<{ data: OrderDocument[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;

    const query: any = { customerId: new Types.ObjectId(customerId) };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderRepository.getModel().find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.orderRepository.count(query),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get store orders
   */
  async getStoreOrders(
    storeId: string,
    filters: { status?: OrderStatus; page?: number; limit?: number },
  ): Promise<{ data: OrderDocument[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;

    const query: any = { storeId: new Types.ObjectId(storeId) };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderRepository
        .getModel()
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'accountId')
        .exec(),
      this.orderRepository.count(query),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get all orders (Admin)
   */
  async getAllOrders(filters: {
    status?: OrderStatus;
    storeId?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: OrderDocument[]; total: number; page: number; limit: number }> {
    const { status, storeId, customerId, page = 1, limit = 20 } = filters;

    const query: any = {};
    if (status) {
      query.orderStatus = status;
    }
    if (storeId) {
      query.storeId = new Types.ObjectId(storeId);
    }
    if (customerId) {
      query.customerId = new Types.ObjectId(customerId);
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderRepository
        .getModel()
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'accountId')
        .populate('storeId', 'businessName')
        .exec(),
      this.orderRepository.count(query),
    ]);

    return { data, total, page, limit };
  }

  /**
   * Get order by order number
   */
  async findByOrderNumber(orderNumber: string): Promise<OrderDocument> {
    const order = await this.orderRepository.getModel().findOne({ orderNumber }).exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  /**
   * Get courier orders
   */
  async getCourierOrders(
    courierId: string,
    filters: { status?: OrderStatus; page?: number; limit?: number },
  ): Promise<{ data: OrderDocument[]; total: number; page: number; limit: number }> {
    const { status, page = 1, limit = 20 } = filters;

    const query: any = { courierId: new Types.ObjectId(courierId) };
    if (status) {
      query.orderStatus = status;
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderRepository
        .getModel()
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('customerId', 'accountId')
        .populate('storeId', 'businessName')
        .exec(),
      this.orderRepository.count(query),
    ]);

    return { data, total, page, limit };
  }
}

