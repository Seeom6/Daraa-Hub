import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '../../../../database/schemas/order.schema';
import { Account, AccountDocument } from '../../../../database/schemas/account.schema';
import { CustomerProfile, CustomerProfileDocument } from '../../../../database/schemas/customer-profile.schema';
import { NotificationsService } from '../../../shared/notifications/services/notifications.service';

/**
 * Order Events:
 * - order.created: When a new order is created
 * - order.status_updated: When order status changes
 * - order.cancelled: When order is cancelled
 */

interface OrderCreatedEvent {
  orderId: string;
  customerId: string;
  storeId: string;
  orderNumber: string;
  total: number;
}

interface OrderStatusUpdatedEvent {
  orderId: string;
  customerId: string;
  storeId: string;
  orderNumber: string;
  oldStatus: string;
  newStatus: string;
  notes?: string;
}

interface OrderCancelledEvent {
  orderId: string;
  customerId: string;
  storeId: string;
  orderNumber: string;
  reason: string;
}

@Injectable()
export class OrderEventsListener {
  private readonly logger = new Logger(OrderEventsListener.name);

  constructor(
    @InjectModel(Order.name)
    private orderModel: Model<OrderDocument>,
    @InjectModel(Account.name)
    private accountModel: Model<AccountDocument>,
    @InjectModel(CustomerProfile.name)
    private customerProfileModel: Model<CustomerProfileDocument>,
    private notificationsService: NotificationsService,
  ) {}

  /**
   * جلب accountId من customerProfileId
   * Get accountId from customerProfileId
   */
  private async getCustomerAccountId(customerProfileId: string): Promise<string | null> {
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
   * Send notifications to customer and store owner
   */
  @OnEvent('order.created')
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`Order created: ${event.orderNumber}`);
    this.logger.debug(`Event data: ${JSON.stringify(event)}`);

    try {
      // Get store owner account
      this.logger.debug(`Looking for store owner with storeId: ${event.storeId}`);
      const storeOwner = await this.accountModel.findOne({
        roleProfileId: new Types.ObjectId(event.storeId),
        roleProfileRef: 'StoreOwnerProfile',
      });

      if (storeOwner) {
        this.logger.debug(`Store owner found: ${storeOwner._id}`);
      } else {
        this.logger.warn(`Store owner NOT found for storeId: ${event.storeId}`);
      }

      // Notification to customer
      // Get customer account ID from customer profile ID
      const customerAccountId = await this.getCustomerAccountId(event.customerId);

      if (customerAccountId) {
        this.logger.debug(`Creating customer notification for accountId: ${customerAccountId}`);
        await this.notificationsService.create({
          recipientId: customerAccountId,
          recipientRole: 'customer',
          title: `تم تقديم الطلب بنجاح`,
          message: `تم تقديم طلبك #${event.orderNumber} بنجاح. المجموع: $${event.total}`,
          type: 'order',
          priority: 'success',
          channels: ['in_app', 'sms'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            orderId: event.orderId,
            orderNumber: event.orderNumber,
            total: event.total,
            action: 'view_order',
          },
        });
        this.logger.debug(`Customer notification created`);
      } else {
        this.logger.warn(`Could not create customer notification - account ID not found for customer: ${event.customerId}`);
      }

      // Notification to store owner
      if (storeOwner) {
        this.logger.debug(`Creating store owner notification for: ${storeOwner._id}`);
        await this.notificationsService.create({
          recipientId: (storeOwner._id as any).toString(),
          recipientRole: 'store_owner',
          title: `طلب جديد`,
          message: `لديك طلب جديد #${event.orderNumber}. المجموع: $${event.total}`,
          type: 'order',
          priority: 'success',
          channels: ['in_app', 'sms'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            orderId: event.orderId,
            orderNumber: event.orderNumber,
            total: event.total,
            action: 'view_order',
          },
        });
        this.logger.debug(`Store owner notification created`);
      }

      this.logger.log(`Notifications sent for order ${event.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send notifications for order ${event.orderNumber}:`, error);
    }
  }

  /**
   * Handle order status updated event
   * Send notification to customer
   */
  @OnEvent('order.status_updated')
  async handleOrderStatusUpdated(event: OrderStatusUpdatedEvent) {
    this.logger.log(`Order status updated: ${event.orderNumber} - ${event.oldStatus} -> ${event.newStatus}`);

    try {
      const statusMessages = {
        confirmed: 'تم تأكيد طلبك',
        preparing: 'جاري تحضير طلبك',
        ready: 'طلبك جاهز للاستلام',
        picked_up: 'تم استلام طلبك من قبل المندوب',
        delivering: 'طلبك في الطريق',
        delivered: 'تم توصيل طلبك',
      };

      const message = statusMessages[event.newStatus] || `تم تحديث حالة الطلب إلى ${event.newStatus}`;

      // Notification to customer
      // Get customer account ID from customer profile ID
      const customerAccountId = await this.getCustomerAccountId(event.customerId);

      if (customerAccountId) {
        await this.notificationsService.create({
          recipientId: customerAccountId,
          recipientRole: 'customer',
          title: 'تحديث حالة الطلب',
          message: `الطلب #${event.orderNumber}: ${message}`,
          type: 'order',
          priority: event.newStatus === 'delivered' ? 'success' : 'info',
          channels: ['in_app', 'sms'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            orderId: event.orderId,
            orderNumber: event.orderNumber,
            oldStatus: event.oldStatus,
            newStatus: event.newStatus,
            action: 'view_order',
          },
        });

        this.logger.log(`Status update notification sent for order ${event.orderNumber}`);
      } else {
        this.logger.warn(`Could not send status update notification - account ID not found for customer: ${event.customerId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send status update notification for order ${event.orderNumber}:`, error);
    }
  }

  /**
   * Handle order cancelled event
   * Send notifications to customer and store owner
   */
  @OnEvent('order.cancelled')
  async handleOrderCancelled(event: OrderCancelledEvent) {
    this.logger.log(`Order cancelled: ${event.orderNumber} - Reason: ${event.reason}`);

    try {
      // Get store owner account
      const storeOwner = await this.accountModel.findOne({
        roleProfileId: new Types.ObjectId(event.storeId),
        roleProfileRef: 'StoreOwnerProfile',
      });

      // Notification to customer
      // Get customer account ID from customer profile ID
      const customerAccountId = await this.getCustomerAccountId(event.customerId);

      if (customerAccountId) {
        await this.notificationsService.create({
          recipientId: customerAccountId,
          recipientRole: 'customer',
          title: 'تم إلغاء الطلب',
          message: `تم إلغاء طلبك #${event.orderNumber}. السبب: ${event.reason}`,
          type: 'order',
          priority: 'warning',
          channels: ['in_app', 'sms'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            orderId: event.orderId,
            orderNumber: event.orderNumber,
            reason: event.reason,
            action: 'view_order',
          },
        });
      } else {
        this.logger.warn(`Could not send cancellation notification - account ID not found for customer: ${event.customerId}`);
      }

      // Notification to store owner
      if (storeOwner) {
        await this.notificationsService.create({
          recipientId: (storeOwner._id as any).toString(),
          recipientRole: 'store_owner',
          title: 'تم إلغاء الطلب',
          message: `تم إلغاء الطلب #${event.orderNumber}. السبب: ${event.reason}`,
          type: 'order',
          priority: 'info',
          channels: ['in_app'],
          relatedId: event.orderId,
          relatedModel: 'Order',
          data: {
            orderId: event.orderId,
            orderNumber: event.orderNumber,
            reason: event.reason,
            action: 'view_order',
          },
        });
      }

      this.logger.log(`Cancellation notifications sent for order ${event.orderNumber}`);
    } catch (error) {
      this.logger.error(`Failed to send cancellation notifications for order ${event.orderNumber}:`, error);
    }
  }
}

