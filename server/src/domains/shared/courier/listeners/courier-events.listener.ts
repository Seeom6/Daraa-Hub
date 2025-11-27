import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../../../database/schemas/order.schema';
import { Payment, PaymentDocument, PaymentMethodType } from '../../../../database/schemas/payment.schema';
import { PaymentService } from '../../../e-commerce/payment/services/payment.service';

/**
 * Courier Events Listener
 * Handles events related to courier operations
 */
@Injectable()
export class CourierEventsListener {
  private readonly logger = new Logger(CourierEventsListener.name);

  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name)
    private paymentModel: Model<PaymentDocument>,
    private paymentService: PaymentService,
  ) {}

  /**
   * Handle delivery status update
   * When order is delivered, confirm cash payment if applicable
   */
  @OnEvent('delivery.status.updated')
  async handleDeliveryStatusUpdate(payload: {
    courierId: string;
    orderId: string;
    status: string;
    proofOfDelivery?: any;
  }) {
    this.logger.log(`Handling delivery status update: ${payload.orderId} -> ${payload.status}`);

    // If order is delivered, check if payment is cash and confirm it
    if (payload.status === 'delivered') {
      try {
        const payment = await this.paymentModel.findOne({ orderId: payload.orderId }).exec();

        if (payment && payment.paymentMethod === PaymentMethodType.CASH) {
          this.logger.log(`Confirming cash payment for order ${payload.orderId}`);
          await this.paymentService.confirmCashPaymentByOrderId(
            payload.orderId,
            payload.courierId,
          );
          this.logger.log(`Cash payment confirmed for order ${payload.orderId}`);
        }
      } catch (error) {
        this.logger.error(`Failed to confirm cash payment for order ${payload.orderId}:`, error);
      }
    }
  }

  /**
   * Handle order assigned to courier
   */
  @OnEvent('order.assigned.to.courier')
  async handleOrderAssigned(payload: {
    orderId: string;
    courierId: string;
    assignedBy: string;
  }) {
    this.logger.log(`Order ${payload.orderId} assigned to courier ${payload.courierId}`);
    // TODO: Send notification to courier
  }

  /**
   * Handle courier order accepted
   */
  @OnEvent('courier.order.accepted')
  async handleOrderAccepted(payload: {
    courierId: string;
    orderId: string;
    notes?: string;
  }) {
    this.logger.log(`Courier ${payload.courierId} accepted order ${payload.orderId}`);
    // TODO: Send notification to customer and store
  }

  /**
   * Handle courier order rejected
   */
  @OnEvent('courier.order.rejected')
  async handleOrderRejected(payload: {
    courierId: string;
    orderId: string;
    reason: string;
  }) {
    this.logger.log(`Courier ${payload.courierId} rejected order ${payload.orderId}: ${payload.reason}`);
    // TODO: Send notification to admin/store and reassign order
  }

  /**
   * Handle courier suspended
   */
  @OnEvent('courier.suspended')
  async handleCourierSuspended(payload: {
    courierId: string;
    suspendedBy: string;
    reason: string;
  }) {
    this.logger.log(`Courier ${payload.courierId} suspended by ${payload.suspendedBy}: ${payload.reason}`);
    // TODO: Send notification to courier
  }

  /**
   * Handle courier unsuspended
   */
  @OnEvent('courier.unsuspended')
  async handleCourierUnsuspended(payload: {
    courierId: string;
  }) {
    this.logger.log(`Courier ${payload.courierId} unsuspended`);
    // TODO: Send notification to courier
  }
}

