import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { OrderEventsListener } from './order-events.listener';
import { OrderRepository } from '../repositories/order.repository';
import { AccountRepository } from '../../../shared/accounts/repositories/account.repository';
import { CustomerProfileRepository } from '../../../shared/accounts/repositories/customer-profile.repository';
import { NotificationsService } from '../../../shared/notifications/services/notifications.service';

describe('OrderEventsListener', () => {
  let listener: OrderEventsListener;
  let orderRepository: jest.Mocked<OrderRepository>;
  let accountRepository: jest.Mocked<AccountRepository>;
  let customerProfileRepository: jest.Mocked<CustomerProfileRepository>;
  let notificationsService: jest.Mocked<NotificationsService>;

  const mockStoreOwnerId = new Types.ObjectId();
  const mockCustomerAccountId = new Types.ObjectId();
  const mockCustomerProfileId = new Types.ObjectId();
  const mockStoreId = new Types.ObjectId();
  const mockOrderId = new Types.ObjectId();

  beforeEach(async () => {
    const mockAccountModel = {
      findOne: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderEventsListener,
        {
          provide: OrderRepository,
          useValue: {},
        },
        {
          provide: AccountRepository,
          useValue: {
            getModel: jest.fn().mockReturnValue(mockAccountModel),
          },
        },
        {
          provide: CustomerProfileRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    listener = module.get<OrderEventsListener>(OrderEventsListener);
    orderRepository = module.get(OrderRepository);
    accountRepository = module.get(AccountRepository);
    customerProfileRepository = module.get(CustomerProfileRepository);
    notificationsService = module.get(NotificationsService);
  });

  describe('handleOrderCreated', () => {
    const orderCreatedEvent = {
      orderId: mockOrderId.toString(),
      customerId: mockCustomerProfileId.toString(),
      storeId: mockStoreId.toString(),
      orderNumber: 'ORD-001',
      total: 100,
    };

    it('should send notifications to customer and store owner', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreOwner),
      });
      customerProfileRepository.findById.mockResolvedValue(
        mockCustomerProfile as any,
      );

      await listener.handleOrderCreated(orderCreatedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(2);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: mockCustomerAccountId.toString(),
          recipientRole: 'customer',
          type: 'order',
        }),
      );
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: mockStoreOwnerId.toString(),
          recipientRole: 'store_owner',
          type: 'order',
        }),
      );
    });

    it('should handle missing customer profile', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };

      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreOwner),
      });
      customerProfileRepository.findById.mockResolvedValue(null);

      await listener.handleOrderCreated(orderCreatedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle missing store owner', async () => {
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      customerProfileRepository.findById.mockResolvedValue(
        mockCustomerProfile as any,
      );

      await listener.handleOrderCreated(orderCreatedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(
        listener.handleOrderCreated(orderCreatedEvent),
      ).resolves.not.toThrow();
    });

    it('should handle customer profile lookup error', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };

      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreOwner),
      });
      customerProfileRepository.findById.mockRejectedValue(
        new Error('DB Error'),
      );

      await listener.handleOrderCreated(orderCreatedEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleOrderStatusUpdated', () => {
    const orderStatusUpdatedEvent = {
      orderId: mockOrderId.toString(),
      customerId: mockCustomerProfileId.toString(),
      storeId: mockStoreId.toString(),
      orderNumber: 'ORD-001',
      oldStatus: 'pending',
      newStatus: 'confirmed',
    };

    it('should send notification to customer with confirmed status', async () => {
      const mockCustomerProfile = { accountId: mockCustomerAccountId };
      customerProfileRepository.findById.mockResolvedValue(
        mockCustomerProfile as any,
      );

      await listener.handleOrderStatusUpdated(orderStatusUpdatedEvent);

      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: mockCustomerAccountId.toString(),
          recipientRole: 'customer',
          type: 'order',
          priority: 'info',
        }),
      );
    });

    it('should send notification with success priority for delivered status', async () => {
      const mockCustomerProfile = { accountId: mockCustomerAccountId };
      customerProfileRepository.findById.mockResolvedValue(
        mockCustomerProfile as any,
      );

      await listener.handleOrderStatusUpdated({
        ...orderStatusUpdatedEvent,
        newStatus: 'delivered',
      });

      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'success',
        }),
      );
    });

    it('should handle unknown status', async () => {
      const mockCustomerProfile = { accountId: mockCustomerAccountId };
      customerProfileRepository.findById.mockResolvedValue(
        mockCustomerProfile as any,
      );

      await listener.handleOrderStatusUpdated({
        ...orderStatusUpdatedEvent,
        newStatus: 'unknown_status',
      });

      expect(notificationsService.create).toHaveBeenCalled();
    });

    it('should handle missing customer profile', async () => {
      customerProfileRepository.findById.mockResolvedValue(null);

      await listener.handleOrderStatusUpdated(orderStatusUpdatedEvent);

      expect(notificationsService.create).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      customerProfileRepository.findById.mockRejectedValue(
        new Error('DB Error'),
      );

      await expect(
        listener.handleOrderStatusUpdated(orderStatusUpdatedEvent),
      ).resolves.not.toThrow();
    });
  });

  describe('handleOrderCancelled', () => {
    const orderCancelledEvent = {
      orderId: mockOrderId.toString(),
      customerId: mockCustomerProfileId.toString(),
      storeId: mockStoreId.toString(),
      orderNumber: 'ORD-001',
      reason: 'Customer request',
    };

    it('should send notifications to customer and store owner', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreOwner),
      });
      customerProfileRepository.findById.mockResolvedValue(
        mockCustomerProfile as any,
      );

      await listener.handleOrderCancelled(orderCancelledEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(2);
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: mockCustomerAccountId.toString(),
          recipientRole: 'customer',
          priority: 'warning',
        }),
      );
      expect(notificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          recipientId: mockStoreOwnerId.toString(),
          recipientRole: 'store_owner',
          priority: 'info',
        }),
      );
    });

    it('should handle missing customer profile', async () => {
      const mockStoreOwner = { _id: mockStoreOwnerId };

      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockStoreOwner),
      });
      customerProfileRepository.findById.mockResolvedValue(null);

      await listener.handleOrderCancelled(orderCancelledEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle missing store owner', async () => {
      const mockCustomerProfile = { accountId: mockCustomerAccountId };

      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      customerProfileRepository.findById.mockResolvedValue(
        mockCustomerProfile as any,
      );

      await listener.handleOrderCancelled(orderCancelledEvent);

      expect(notificationsService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      (accountRepository.getModel().findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB Error')),
      });

      await expect(
        listener.handleOrderCancelled(orderCancelledEvent),
      ).resolves.not.toThrow();
    });
  });
});
