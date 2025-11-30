import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Account,
  AccountDocument,
} from '../../../../database/schemas/account.schema';
import {
  CustomerProfile,
  CustomerProfileDocument,
} from '../../../../database/schemas/customer-profile.schema';
import { NotificationsService } from '../../../shared/notifications/services/notifications.service';
import { PaymentService } from '../services/payment.service';

/**
 * Payment Events:
 * - order.created: When a new order is created (create payment)
 * - payment.processed: When payment is initiated
 * - payment.completed: When payment is successful
 * - payment.failed: When payment fails
 * - payment.refunded: When payment is refunded
 */

interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  storeId: string;
  orderNumber: string;
  total: number;
  paymentMethod?: string;
}

interface PaymentProcessedEvent {
  paymentId: string;
  orderId: string;
  customerId: string;
  storeId: string;
  amount: number;
  paymentMethod: string;
}

interface PaymentCompletedEvent {
  paymentId: string;
  orderId: string;
  customerId: string;
  storeId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}

interface PaymentFailedEvent {
  paymentId: string;
  orderId: string;
  customerId: string;
  storeId: string;
  amount: number;
  paymentMethod: string;
  reason: string;
}

interface PaymentRefundedEvent {
  paymentId: string;
  orderId: string;
  customerId: string;
  storeId: string;
  amount: number;
  refundAmount: number;
  reason: string;
  refundedBy: string;
}

interface OrderStatusUpdatedEvent {
  orderId: string;
  status: string;
  updatedBy: string;
}

@Injectable()
export class PaymentEventsListener {
  private readonly logger = new Logger(PaymentEventsListener.name);

  constructor(
    @InjectModel(Account.name)
    private accountModel: Model<AccountDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private notificationsService: NotificationsService,
    private paymentService: PaymentService,
  ) {}

  /**
   * جلب accountId من customerProfileId
   * Get accountId from customerProfileId
   */
  private async getCustomerAccountId(
    customerProfileId: string,
  ): Promise<string | null> {
    try {
      const customerProfile = await this.customerProfileModel
        .findById(customerProfileId)
        .exec();

      if (!customerProfile) {
        this.logger.warn(`Customer profile not found: ${customerProfileId}`);
        return null;
      }

      return (customerProfile.accountId as any).toString();
    } catch (error) {
      this.logger.error(`Failed to get customer account ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Handle order created event
   * Create payment record for the order
   */
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(
      `Order created: ${event.orderNumber} - Creating payment record`,
    );

    try {
      // Use payment method from event (no need to query order again)
      const paymentMethod = event.paymentMethod || 'cash';

      // Create payment record - cast payment method to PaymentMethodType
      await this.paymentService.createPayment(
        event.orderId,
        paymentMethod as any,
      );
      this.logger.log(`Payment record created for order ${event.orderNumber}`);
    } catch (error) {
      this.logger.error(
        `Failed to create payment for order ${event.orderNumber}:`,
        error,
      );
    }
  }

  /**
   * Handle order status updated event
   * Auto-confirm cash payment when order is delivered
   */
  @OnEvent('order.status_updated')
  async handleOrderStatusUpdated(event: OrderStatusUpdatedEvent) {
    if (event.status !== 'delivered') {
      return;
    }

    this.logger.log(
      `Order ${event.orderId} delivered - checking for cash payment confirmation`,
    );

    try {
      // Try to confirm cash payment
      await this.paymentService.confirmCashPaymentByOrderId(
        event.orderId,
        event.updatedBy,
      );
      this.logger.log(`Cash payment confirmed for order ${event.orderId}`);
    } catch (error) {
      // Log error but don't throw - payment might not be cash or already confirmed
      this.logger.warn(
        `Could not confirm cash payment for order ${event.orderId}: ${error.message}`,
      );
    }
  }

  /**
   * Handle payment processed event
   */
  @OnEvent('payment.processed')
  async handlePaymentProcessed(event: PaymentProcessedEvent) {
    this.logger.log(
      `Payment processed: ${event.paymentId} - Amount: $${event.amount}`,
    );

    try {
      // Get customer account ID from customer profile ID
      const customerAccountId = await this.getCustomerAccountId(
        event.customerId,
      );

      // Get store owner account
      const storeOwner = await this.accountModel.findOne({
        roleProfileId: new Types.ObjectId(event.storeId),
        roleProfileRef: 'StoreOwnerProfile',
      });

      if (customerAccountId) {
        // Notification to customer
        await this.notificationsService.create({
          recipientId: customerAccountId,
          recipientRole: 'customer',
          title: 'جاري معالجة الدفع',
          message: `جاري معالجة دفعتك بقيمة $${event.amount}`,
          type: 'payment',
          priority: 'info',
          channels: ['in_app'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            paymentId: event.paymentId,
            orderId: event.orderId,
            amount: event.amount,
            paymentMethod: event.paymentMethod,
          },
        });

        this.logger.log(
          `Payment processing notification sent to customer for payment ${event.paymentId}`,
        );
      } else {
        this.logger.warn(
          `Could not send payment processing notification - account ID not found for customer: ${event.customerId}`,
        );
      }

      // Notification to store owner
      if (storeOwner) {
        await this.notificationsService.create({
          recipientId: (storeOwner._id as any).toString(),
          recipientRole: 'store_owner',
          title: 'جاري معالجة الدفع',
          message: `جاري معالجة دفعة بقيمة $${event.amount} للطلب`,
          type: 'payment',
          priority: 'info',
          channels: ['in_app'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            paymentId: event.paymentId,
            orderId: event.orderId,
            amount: event.amount,
            paymentMethod: event.paymentMethod,
            action: 'view_order',
          },
        });

        this.logger.log(
          `Payment processing notification sent to store owner for payment ${event.paymentId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send payment processing notifications:`,
        error,
      );
    }
  }

  /**
   * Handle payment completed event
   */
  @OnEvent('payment.completed')
  async handlePaymentCompleted(event: PaymentCompletedEvent) {
    this.logger.log(
      `Payment completed: ${event.paymentId} - Amount: $${event.amount}`,
    );

    try {
      // Get store owner account
      const storeOwner = await this.accountModel.findOne({
        roleProfileId: new Types.ObjectId(event.storeId),
        roleProfileRef: 'StoreOwnerProfile',
      });

      // Get customer account ID from customer profile ID
      const customerAccountId = await this.getCustomerAccountId(
        event.customerId,
      );

      if (customerAccountId) {
        // Notification to customer
        await this.notificationsService.create({
          recipientId: customerAccountId,
          recipientRole: 'customer',
          title: 'تم الدفع بنجاح',
          message: `تم إتمام دفعتك بقيمة $${event.amount} بنجاح`,
          type: 'payment',
          priority: 'success',
          channels: ['in_app', 'sms'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            paymentId: event.paymentId,
            orderId: event.orderId,
            amount: event.amount,
            paymentMethod: event.paymentMethod,
            transactionId: event.transactionId,
            action: 'view_order',
          },
        });
      } else {
        this.logger.warn(
          `Could not send payment completion notification - account ID not found for customer: ${event.customerId}`,
        );
      }

      // Notification to store owner
      if (storeOwner) {
        await this.notificationsService.create({
          recipientId: (storeOwner._id as any).toString(),
          recipientRole: 'store_owner',
          title: 'تم استلام الدفع',
          message: `تم استلام دفعة بقيمة $${event.amount} للطلب`,
          type: 'payment',
          priority: 'info',
          channels: ['in_app'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            paymentId: event.paymentId,
            orderId: event.orderId,
            amount: event.amount,
            paymentMethod: event.paymentMethod,
            action: 'view_order',
          },
        });
      }

      this.logger.log(
        `Payment completion notifications sent for payment ${event.paymentId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send payment completion notifications:`,
        error,
      );
    }
  }

  /**
   * Handle payment failed event
   */
  @OnEvent('payment.failed')
  async handlePaymentFailed(event: PaymentFailedEvent) {
    this.logger.log(
      `Payment failed: ${event.paymentId} - Reason: ${event.reason}`,
    );

    try {
      // Get customer account ID from customer profile ID
      const customerAccountId = await this.getCustomerAccountId(
        event.customerId,
      );

      if (customerAccountId) {
        // Notification to customer
        await this.notificationsService.create({
          recipientId: customerAccountId,
          recipientRole: 'customer',
          title: 'فشل الدفع',
          message: `فشلت دفعتك بقيمة $${event.amount}. السبب: ${event.reason}`,
          type: 'payment',
          priority: 'error',
          channels: ['in_app', 'sms'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            paymentId: event.paymentId,
            orderId: event.orderId,
            amount: event.amount,
            paymentMethod: event.paymentMethod,
            reason: event.reason,
            action: 'retry_payment',
          },
        });

        this.logger.log(
          `Payment failure notification sent for payment ${event.paymentId}`,
        );
      } else {
        this.logger.warn(
          `Could not send payment failure notification - account ID not found for customer: ${event.customerId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Failed to send payment failure notification:`, error);
    }
  }

  /**
   * Handle payment refunded event
   */
  @OnEvent('payment.refunded')
  async handlePaymentRefunded(event: PaymentRefundedEvent) {
    this.logger.log(
      `Payment refunded: ${event.paymentId} - Amount: $${event.refundAmount}`,
    );

    try {
      // Get store owner account
      const storeOwner = await this.accountModel.findOne({
        roleProfileId: new Types.ObjectId(event.storeId),
        roleProfileRef: 'StoreOwnerProfile',
      });

      // Get customer account ID from customer profile ID
      const customerAccountId = await this.getCustomerAccountId(
        event.customerId,
      );

      if (customerAccountId) {
        // Notification to customer
        await this.notificationsService.create({
          recipientId: customerAccountId,
          recipientRole: 'customer',
          title: 'تم استرجاع المبلغ',
          message: `تم معالجة استرجاع بقيمة $${event.refundAmount}. السبب: ${event.reason}`,
          type: 'payment',
          priority: 'success',
          channels: ['in_app', 'sms'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            paymentId: event.paymentId,
            orderId: event.orderId,
            originalAmount: event.amount,
            refundAmount: event.refundAmount,
            reason: event.reason,
            refundedBy: event.refundedBy,
            action: 'view_order',
          },
        });
      } else {
        this.logger.warn(
          `Could not send refund notification - account ID not found for customer: ${event.customerId}`,
        );
      }

      // Notification to store owner
      if (storeOwner) {
        await this.notificationsService.create({
          recipientId: (storeOwner._id as any).toString(),
          recipientRole: 'store_owner',
          title: 'تم استرجاع المبلغ',
          message: `تم معالجة استرجاع بقيمة $${event.refundAmount} للطلب. السبب: ${event.reason}`,
          type: 'payment',
          priority: 'info',
          channels: ['in_app'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            paymentId: event.paymentId,
            orderId: event.orderId,
            originalAmount: event.amount,
            refundAmount: event.refundAmount,
            reason: event.reason,
            refundedBy: event.refundedBy,
            action: 'view_order',
          },
        });
      }

      this.logger.log(
        `Refund notifications sent for payment ${event.paymentId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send refund notifications:`, error);
    }
  }
}
