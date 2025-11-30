import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PaymentDocument,
  PaymentStatusType,
} from '../../../../database/schemas/payment.schema';
import {
  Order,
  OrderDocument,
  PaymentStatus,
} from '../../../../database/schemas/order.schema';
import { RefundPaymentDto } from '../dto';
import { PaymentRepository } from '../repositories/payment.repository';

/**
 * Service for payment refund operations
 * Handles full and partial refunds
 */
@Injectable()
export class PaymentRefundService {
  private readonly logger = new Logger(PaymentRefundService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Refund payment
   */
  async refundPayment(
    paymentId: string,
    refundDto: RefundPaymentDto,
    refundedBy: string,
  ): Promise<PaymentDocument> {
    const payment = await this.paymentRepository.getModel().findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatusType.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    const totalRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0);

    if (totalRefunded + refundDto.amount > payment.amount) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    // Add refund
    payment.refunds.push({
      amount: refundDto.amount,
      reason: refundDto.reason,
      refundedAt: new Date(),
      refundedBy: new Types.ObjectId(refundedBy),
    });

    // Update status
    const newTotalRefunded = totalRefunded + refundDto.amount;
    if (newTotalRefunded >= payment.amount) {
      payment.status = PaymentStatusType.REFUNDED;
    } else {
      payment.status = PaymentStatusType.PARTIALLY_REFUNDED;
    }

    await payment.save();

    // Update order
    const order = await this.orderModel.findById(payment.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus =
      payment.status === PaymentStatusType.REFUNDED
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PAID;
    await order.save();

    this.logger.log(`Payment ${paymentId} refunded: ${refundDto.amount}`);

    // Emit event
    this.eventEmitter.emit('payment.refunded', {
      paymentId: (payment._id as Types.ObjectId).toString(),
      orderId: payment.orderId.toString(),
      customerId: order.customerId.toString(),
      storeId: order.storeId.toString(),
      amount: payment.amount,
      refundAmount: refundDto.amount,
      reason: refundDto.reason,
      refundedBy,
    });

    return payment;
  }

  /**
   * Get refund history for a payment
   */
  async getRefundHistory(paymentId: string): Promise<any[]> {
    const payment = await this.paymentRepository.getModel().findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment.refunds;
  }

  /**
   * Calculate total refunded amount
   */
  async getTotalRefunded(paymentId: string): Promise<number> {
    const payment = await this.paymentRepository.getModel().findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment.refunds.reduce((sum, r) => sum + r.amount, 0);
  }
}
