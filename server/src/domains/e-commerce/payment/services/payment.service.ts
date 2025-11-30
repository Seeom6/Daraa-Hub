import { Injectable } from '@nestjs/common';
import {
  PaymentDocument,
  PaymentMethodType,
} from '../../../../database/schemas/payment.schema';
import { ProcessPaymentDto, RefundPaymentDto } from '../dto';
import { PaymentProcessingService } from './payment-processing.service';
import { PaymentRefundService } from './payment-refund.service';
import { PaymentQueryService } from './payment-query.service';

/**
 * Payment Facade Service
 * Provides unified access to all payment sub-services
 * Maintains backward compatibility with existing code
 */
@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentProcessingService: PaymentProcessingService,
    private readonly paymentRefundService: PaymentRefundService,
    private readonly paymentQueryService: PaymentQueryService,
  ) {}

  // ==================== Payment Processing ====================

  /**
   * Create payment record for order
   */
  async createPayment(
    orderId: string,
    paymentMethod: PaymentMethodType,
  ): Promise<PaymentDocument> {
    return this.paymentProcessingService.createPayment(orderId, paymentMethod);
  }

  /**
   * Process payment
   */
  async processPayment(
    processDto: ProcessPaymentDto,
    processedBy: string,
  ): Promise<PaymentDocument> {
    return this.paymentProcessingService.processPayment(
      processDto,
      processedBy,
    );
  }

  /**
   * Confirm payment (for online payments)
   */
  async confirmPayment(
    paymentId: string,
    transactionId: string,
  ): Promise<PaymentDocument> {
    return this.paymentProcessingService.confirmPayment(
      paymentId,
      transactionId,
    );
  }

  /**
   * Confirm cash payment by courier upon delivery
   */
  async confirmCashPaymentByOrderId(
    orderId: string,
    confirmedBy: string,
  ): Promise<PaymentDocument> {
    return this.paymentProcessingService.confirmCashPaymentByOrderId(
      orderId,
      confirmedBy,
    );
  }

  /**
   * Mark payment as failed
   */
  async failPayment(
    paymentId: string,
    reason: string,
  ): Promise<PaymentDocument> {
    return this.paymentProcessingService.failPayment(paymentId, reason);
  }

  // ==================== Refunds ====================

  /**
   * Refund payment
   */
  async refundPayment(
    paymentId: string,
    refundDto: RefundPaymentDto,
    refundedBy: string,
  ): Promise<PaymentDocument> {
    return this.paymentRefundService.refundPayment(
      paymentId,
      refundDto,
      refundedBy,
    );
  }

  // ==================== Queries ====================

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentDocument | null> {
    return this.paymentQueryService.getPaymentByOrderId(orderId);
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentDocument> {
    return this.paymentQueryService.getPaymentById(paymentId);
  }

  /**
   * Get all payments (Admin only)
   */
  async getAllPayments(): Promise<PaymentDocument[]> {
    return this.paymentQueryService.getAllPayments();
  }

  /**
   * Get customer's payments
   */
  async getCustomerPayments(customerId: string): Promise<PaymentDocument[]> {
    return this.paymentQueryService.getCustomerPayments(customerId);
  }

  /**
   * Get store's payments
   */
  async getStorePayments(storeId: string): Promise<PaymentDocument[]> {
    return this.paymentQueryService.getStorePayments(storeId);
  }
}
