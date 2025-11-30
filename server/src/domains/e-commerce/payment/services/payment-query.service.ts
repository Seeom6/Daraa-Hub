import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PaymentDocument } from '../../../../database/schemas/payment.schema';
import { PaymentRepository } from '../repositories/payment.repository';

/**
 * Service for payment query operations
 * Handles payment lookups and listings
 */
@Injectable()
export class PaymentQueryService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentDocument | null> {
    return this.paymentRepository
      .getModel()
      .findOne({ orderId: new Types.ObjectId(orderId) });
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentDocument> {
    const payment = await this.paymentRepository.getModel().findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get all payments (Admin only)
   */
  async getAllPayments(): Promise<PaymentDocument[]> {
    return this.paymentRepository
      .getModel()
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get customer's payments
   */
  async getCustomerPayments(customerId: string): Promise<PaymentDocument[]> {
    return this.paymentRepository
      .getModel()
      .find({ customerId: new Types.ObjectId(customerId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get store's payments
   */
  async getStorePayments(storeId: string): Promise<PaymentDocument[]> {
    return this.paymentRepository
      .getModel()
      .find({ storeId: new Types.ObjectId(storeId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get payments with pagination
   */
  async getPaymentsWithPagination(
    filter: any,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PaymentDocument[]; meta: any }> {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.paymentRepository
        .getModel()
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.paymentRepository.count(filter),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
