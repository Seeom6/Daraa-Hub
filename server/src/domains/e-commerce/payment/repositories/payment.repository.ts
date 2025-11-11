import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment, PaymentDocument } from '../../../../database/schemas/payment.schema';
import { BaseRepository } from '../../../shared/base/base.repository';

@Injectable()
export class PaymentRepository extends BaseRepository<PaymentDocument> {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    super(paymentModel);
  }

  /**
   * Find payment by order ID
   */
  async findByOrderId(orderId: string): Promise<PaymentDocument | null> {
    return this.findOne({ orderId: new Types.ObjectId(orderId) });
  }

  /**
   * Find payments by customer ID
   */
  async findByCustomerId(
    customerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: PaymentDocument[]; total: number }> {
    return this.findWithPagination(
      { customerId: new Types.ObjectId(customerId) },
      page,
      limit,
      { sort: { createdAt: -1 } },
    );
  }

  /**
   * Update payment status
   */
  async updateStatus(
    paymentId: string,
    status: string,
  ): Promise<PaymentDocument | null> {
    return this.findByIdAndUpdate(paymentId, { status });
  }
}
