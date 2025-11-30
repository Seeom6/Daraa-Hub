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
  Payment,
  PaymentDocument,
  PaymentStatusType,
  PaymentMethodType,
} from '../../../../database/schemas/payment.schema';
import {
  Order,
  OrderDocument,
  PaymentStatus,
} from '../../../../database/schemas/order.schema';
import { ProcessPaymentDto } from '../dto';
import { PaymentRepository } from '../repositories/payment.repository';

/**
 * Service for payment processing operations
 * Handles payment creation, processing, and confirmation
 */
@Injectable()
export class PaymentProcessingService {
  private readonly logger = new Logger(PaymentProcessingService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create payment record for order
   */
  async createPayment(
    orderId: string,
    paymentMethod: PaymentMethodType,
  ): Promise<PaymentDocument> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if payment already exists
    const existingPayment = await this.paymentRepository
      .getModel()
      .findOne({ orderId: new Types.ObjectId(orderId) });
    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this order');
    }

    const payment = await this.paymentRepository.create({
      orderId: new Types.ObjectId(orderId),
      customerId: order.customerId,
      storeId: order.storeId,
      amount: order.total,
      paymentMethod,
      status: PaymentStatusType.PENDING,
    });

    this.logger.log(`Payment created for order ${orderId}`);

    return payment;
  }

  /**
   * Process payment
   */
  async processPayment(
    processDto: ProcessPaymentDto,
    processedBy: string,
  ): Promise<PaymentDocument> {
    const { orderId, paymentMethod, paymentBreakdown, gatewayResponse } =
      processDto;

    // Get or create payment
    const existingPayment = await this.paymentRepository
      .getModel()
      .findOne({ orderId: new Types.ObjectId(orderId) });

    let payment: PaymentDocument;
    if (!existingPayment) {
      payment = await this.createPayment(orderId, paymentMethod);
    } else {
      payment = existingPayment;
    }

    if (payment.status === PaymentStatusType.COMPLETED) {
      throw new BadRequestException('Payment already completed');
    }

    // Update payment
    payment.status = PaymentStatusType.PROCESSING;
    payment.paymentMethod = paymentMethod;

    if (paymentBreakdown) {
      payment.paymentBreakdown = paymentBreakdown;
    }

    if (gatewayResponse) {
      payment.gatewayResponse = gatewayResponse;
      payment.transactionId =
        gatewayResponse.transactionId || gatewayResponse.id;
    }

    await payment.save();

    // Update order payment status
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = PaymentStatus.PENDING;
    await order.save();

    this.logger.log(`Payment processed for order ${orderId}`);

    // Emit payment.processed event
    this.eventEmitter.emit('payment.processed', {
      paymentId: (payment._id as Types.ObjectId).toString(),
      orderId,
      customerId: order.customerId.toString(),
      storeId: order.storeId.toString(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
    });

    return payment;
  }

  /**
   * Confirm payment (for online payments)
   */
  async confirmPayment(
    paymentId: string,
    transactionId: string,
  ): Promise<PaymentDocument> {
    const payment = await this.paymentRepository.getModel().findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatusType.COMPLETED) {
      throw new BadRequestException('Payment already completed');
    }

    payment.status = PaymentStatusType.COMPLETED;
    payment.transactionId = transactionId;
    payment.paidAt = new Date();
    await payment.save();

    // Update order
    const order = await this.orderModel.findById(payment.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = PaymentStatus.PAID;
    await order.save();

    this.logger.log(`Payment ${paymentId} confirmed`);

    // Emit event
    this.eventEmitter.emit('payment.completed', {
      paymentId: (payment._id as Types.ObjectId).toString(),
      orderId: payment.orderId.toString(),
      customerId: order.customerId.toString(),
      storeId: order.storeId.toString(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
    });

    return payment;
  }

  /**
   * Confirm cash payment by courier upon delivery
   */
  async confirmCashPaymentByOrderId(
    orderId: string,
    confirmedBy: string,
  ): Promise<PaymentDocument> {
    const payment = await this.paymentRepository
      .getModel()
      .findOne({ orderId: new Types.ObjectId(orderId) });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    if (payment.paymentMethod !== PaymentMethodType.CASH) {
      throw new BadRequestException('This method is only for cash payments');
    }

    if (payment.status === PaymentStatusType.COMPLETED) {
      this.logger.warn(`Payment ${payment._id} already completed`);
      return payment;
    }

    payment.status = PaymentStatusType.COMPLETED;
    payment.paidAt = new Date();
    payment.notes = `Cash payment confirmed by courier upon delivery`;
    await payment.save();

    // Update order
    const order = await this.orderModel.findById(payment.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = PaymentStatus.PAID;
    await order.save();

    this.logger.log(
      `Cash payment confirmed for order ${orderId} by courier ${confirmedBy}`,
    );

    // Emit event
    this.eventEmitter.emit('payment.completed', {
      paymentId: (payment._id as Types.ObjectId).toString(),
      orderId: payment.orderId.toString(),
      customerId: order.customerId.toString(),
      storeId: order.storeId.toString(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      confirmedBy,
    });

    return payment;
  }

  /**
   * Mark payment as failed
   */
  async failPayment(
    paymentId: string,
    reason: string,
  ): Promise<PaymentDocument> {
    const payment = await this.paymentRepository.getModel().findById(paymentId);

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatusType.FAILED;
    payment.failedAt = new Date();
    await payment.save();

    // Update order
    const order = await this.orderModel.findById(payment.orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.paymentStatus = PaymentStatus.FAILED;
    await order.save();

    this.logger.log(`Payment ${paymentId} failed: ${reason}`);

    // Emit event
    this.eventEmitter.emit('payment.failed', {
      paymentId: (payment._id as Types.ObjectId).toString(),
      orderId: payment.orderId.toString(),
      customerId: order.customerId.toString(),
      storeId: order.storeId.toString(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      reason,
    });

    return payment;
  }
}
