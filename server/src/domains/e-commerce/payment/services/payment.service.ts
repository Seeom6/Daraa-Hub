import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Payment, PaymentDocument, PaymentStatusType, PaymentMethodType } from '../../../../database/schemas/payment.schema';
import { Order, OrderDocument, PaymentStatus } from '../../../../database/schemas/order.schema';
import { ProcessPaymentDto, RefundPaymentDto } from '../dto';
import { PaymentRepository } from '../repositories/payment.repository';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly paymentRepository: PaymentRepository,
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create payment record for order
   */
  async createPayment(orderId: string, paymentMethod: PaymentMethodType): Promise<PaymentDocument> {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Check if payment already exists
    const existingPayment = await this.paymentRepository.getModel().findOne({ orderId: new Types.ObjectId(orderId) });
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
  async processPayment(processDto: ProcessPaymentDto, processedBy: string): Promise<PaymentDocument> {
    const { orderId, paymentMethod, paymentBreakdown, gatewayResponse } = processDto;

    // Get or create payment
    const existingPayment = await this.paymentRepository.getModel().findOne({ orderId: new Types.ObjectId(orderId) });

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
      payment.transactionId = gatewayResponse.transactionId || gatewayResponse.id;
    }

    // For cash payments, keep status as PROCESSING until courier confirms delivery
    // For online payments, status remains PROCESSING until payment gateway confirms
    // No automatic completion here

    await payment.save();

    // Update order payment status - always PENDING at this stage
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
  async confirmPayment(paymentId: string, transactionId: string): Promise<PaymentDocument> {
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
   * يؤكد عامل التوصيل استلام الدفع النقدي عند التوصيل
   */
  async confirmCashPaymentByOrderId(orderId: string, confirmedBy: string): Promise<PaymentDocument> {
    const payment = await this.paymentRepository.getModel().findOne({ orderId: new Types.ObjectId(orderId) });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    if (payment.paymentMethod !== PaymentMethodType.CASH) {
      throw new BadRequestException('This method is only for cash payments');
    }

    if (payment.status === PaymentStatusType.COMPLETED) {
      this.logger.warn(`Payment ${payment._id} already completed`);
      return payment; // Already completed, no need to do anything
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

    this.logger.log(`Cash payment confirmed for order ${orderId} by courier ${confirmedBy}`);

    // Emit event
    this.eventEmitter.emit('payment.completed', {
      paymentId: (payment._id as Types.ObjectId).toString(),
      orderId: payment.orderId.toString(),
      customerId: order.customerId.toString(),
      storeId: order.storeId.toString(),
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      confirmedBy, // Courier who confirmed
    });

    return payment;
  }

  /**
   * Mark payment as failed
   */
  async failPayment(paymentId: string, reason: string): Promise<PaymentDocument> {
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

    order.paymentStatus = payment.status === PaymentStatusType.REFUNDED
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
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentDocument | null> {
    return this.paymentRepository.getModel().findOne({ orderId: new Types.ObjectId(orderId) });
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
}

