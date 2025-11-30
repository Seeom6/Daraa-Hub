import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { PaymentEventsListener } from './payment-events.listener';
import { NotificationsService } from '../../../shared/notifications/services/notifications.service';
import { PaymentService } from '../services/payment.service';
import { Account } from '../../../../database/schemas/account.schema';
import { CustomerProfile } from '../../../../database/schemas/customer-profile.schema';

describe('PaymentEventsListener', () => {
  let listener: PaymentEventsListener;
  let accountModel: any;
  let customerProfileModel: any;
  let notificationsService: jest.Mocked<NotificationsService>;
  let paymentService: jest.Mocked<PaymentService>;

  const mockStoreOwnerId = new Types.ObjectId();
  const mockCustomerAccountId = new Types.ObjectId();
  const mockCustomerProfileId = new Types.ObjectId();
  const mockStoreId = new Types.ObjectId();
  const mockOrderId = new Types.ObjectId();
  const mockPaymentId = new Types.ObjectId();

  beforeEach(async () => {
    accountModel = {
      findOne: jest.fn(),
    };

    customerProfileModel = {
      findById: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentEventsListener,
        {
          provide: getModelToken(Account.name),
          useValue: accountModel,
        },
        {
          provide: getModelToken(CustomerProfile.name),
          useValue: customerProfileModel,
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: PaymentService,
          useValue: {
            createPayment: jest.fn().mockResolvedValue({}),
            confirmCashPaymentByOrderId: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    listener = module.get<PaymentEventsListener>(PaymentEventsListener);
    notificationsService = module.get(NotificationsService);
    paymentService = module.get(PaymentService);
  });

  describe('handleOrderCreated', () => {
    const orderCreatedEvent = {
      orderId: mockOrderId.toString(),
      customerId: mockCustomerProfileId.toString(),
      storeId: mockStoreId.toString(),
      orderNumber: 'ORD-001',
      total: 100,
      paymentMethod: 'card',
    };

    it('should create payment record for order', async () => {
      await listener.handleOrderCreated(orderCreatedEvent);

      expect(paymentService.createPayment).toHaveBeenCalledWith(
        orderCreatedEvent.orderId,
        'card',
      );
    });

    it('should use cash as default payment method', async () => {
      await listener.handleOrderCreated({
        ...orderCreatedEvent,
        paymentMethod: undefined,
      });

      expect(paymentService.createPayment).toHaveBeenCalledWith(
        orderCreatedEvent.orderId,
        'cash',
      );
    });

    it('should handle errors gracefully', async () => {
      paymentService.createPayment.mockRejectedValue(new Error('DB Error'));

      await expect(
        listener.handleOrderCreated(orderCreatedEvent),
      ).resolves.not.toThrow();
    });
  });

  describe('handleOrderStatusUpdated', () => {
    it('should confirm cash payment when order is delivered', async () => {
      const event = {
        orderId: mockOrderId.toString(),
        status: 'delivered',
        updatedBy: 'courier-123',
      };

      await listener.handleOrderStatusUpdated(event);

      expect(paymentService.confirmCashPaymentByOrderId).toHaveBeenCalledWith(
        event.orderId,
        event.updatedBy,
      );
    });

    it('should not confirm payment for non-delivered status', async () => {
      const event = {
        orderId: mockOrderId.toString(),
        status: 'preparing',
        updatedBy: 'store-123',
      };

      await listener.handleOrderStatusUpdated(event);

      expect(paymentService.confirmCashPaymentByOrderId).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const event = {
        orderId: mockOrderId.toString(),
        status: 'delivered',
        updatedBy: 'courier-123',
      };

      paymentService.confirmCashPaymentByOrderId.mockRejectedValue(
        new Error('Not cash'),
      );

      await expect(
        listener.handleOrderStatusUpdated(event),
      ).resolves.not.toThrow();
    });
  });

  describe('handlePaymentProcessed', () => {
    const paymentProcessedEvent = {
      paymentId: mockPaymentId.toString(),
      orderId: mockOrderId.toString(),
      customerId: mockCustomerProfileId.toString(),
      storeId: mockStoreId.toString(),
      amount: 100,
      paymentMethod: 'card',
    };

    it('should send notifications to customer and store owner', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      accountModel.findOne.mockResolvedValue(mockStoreOwner);
      customerProfileModel.exec.mockResolvedValue(mockCustomerProfile);

      await listener.handlePaymentProcessed(paymentProcessedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(2);
    });

    it('should handle missing customer profile', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };

      accountModel.findOne.mockResolvedValue(mockStoreOwner);
      customerProfileModel.exec.mockResolvedValue(null);

      await listener.handlePaymentProcessed(paymentProcessedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle missing store owner', async () => {
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      accountModel.findOne.mockResolvedValue(null);
      customerProfileModel.exec.mockResolvedValue(mockCustomerProfile);

      await listener.handlePaymentProcessed(paymentProcessedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      accountModel.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(
        listener.handlePaymentProcessed(paymentProcessedEvent),
      ).resolves.not.toThrow();
    });
  });

  describe('handlePaymentCompleted', () => {
    const paymentCompletedEvent = {
      paymentId: mockPaymentId.toString(),
      orderId: mockOrderId.toString(),
      customerId: mockCustomerProfileId.toString(),
      storeId: mockStoreId.toString(),
      amount: 100,
      paymentMethod: 'card',
      transactionId: 'txn-123',
    };

    it('should send notifications to customer and store owner', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      accountModel.findOne.mockResolvedValue(mockStoreOwner);
      customerProfileModel.exec.mockResolvedValue(mockCustomerProfile);

      await listener.handlePaymentCompleted(paymentCompletedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(2);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientRole: 'customer',
          priority: 'success',
        }),
      );
    });

    it('should handle missing customer profile', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };

      accountModel.findOne.mockResolvedValue(mockStoreOwner);
      customerProfileModel.exec.mockResolvedValue(null);

      await listener.handlePaymentCompleted(paymentCompletedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      accountModel.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(
        listener.handlePaymentCompleted(paymentCompletedEvent),
      ).resolves.not.toThrow();
    });
  });

  describe('handlePaymentFailed', () => {
    const paymentFailedEvent = {
      paymentId: mockPaymentId.toString(),
      orderId: mockOrderId.toString(),
      customerId: mockCustomerProfileId.toString(),
      storeId: mockStoreId.toString(),
      amount: 100,
      paymentMethod: 'card',
      reason: 'Insufficient funds',
    };

    it('should send notification to customer', async () => {
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      customerProfileModel.exec.mockResolvedValue(mockCustomerProfile);

      await listener.handlePaymentFailed(paymentFailedEvent);

      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientRole: 'customer',
          priority: 'error',
        }),
      );
    });

    it('should handle missing customer profile', async () => {
      customerProfileModel.exec.mockResolvedValue(null);

      await listener.handlePaymentFailed(paymentFailedEvent);

      expect(notificationsService.create).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      customerProfileModel.exec.mockRejectedValue(new Error('DB Error'));

      await expect(
        listener.handlePaymentFailed(paymentFailedEvent),
      ).resolves.not.toThrow();
    });
  });

  describe('handlePaymentRefunded', () => {
    const paymentRefundedEvent = {
      paymentId: mockPaymentId.toString(),
      orderId: mockOrderId.toString(),
      customerId: mockCustomerProfileId.toString(),
      storeId: mockStoreId.toString(),
      amount: 100,
      refundAmount: 50,
      reason: 'Customer request',
      refundedBy: 'admin-123',
    };

    it('should send notifications to customer and store owner', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      accountModel.findOne.mockResolvedValue(mockStoreOwner);
      customerProfileModel.exec.mockResolvedValue(mockCustomerProfile);

      await listener.handlePaymentRefunded(paymentRefundedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(2);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientRole: 'customer',
          priority: 'success',
        }),
      );
    });

    it('should handle missing customer profile', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };

      accountModel.findOne.mockResolvedValue(mockStoreOwner);
      customerProfileModel.exec.mockResolvedValue(null);

      await listener.handlePaymentRefunded(paymentRefundedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle missing store owner', async () => {
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      accountModel.findOne.mockResolvedValue(null);
      customerProfileModel.exec.mockResolvedValue(mockCustomerProfile);

      await listener.handlePaymentRefunded(paymentRefundedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      accountModel.findOne.mockRejectedValue(new Error('DB Error'));

      await expect(
        listener.handlePaymentRefunded(paymentRefundedEvent),
      ).resolves.not.toThrow();
    });
  });
});
