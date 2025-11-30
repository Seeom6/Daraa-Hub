import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './services/order.service';
import { OrderCreationService } from './services/order-creation.service';
import { OrderStatusService } from './services/order-status.service';
import { generateObjectId } from '../../shared/testing';
import { OrderStatus } from '../../../database/schemas/order.schema';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: jest.Mocked<OrderService>;
  let orderCreationService: jest.Mocked<OrderCreationService>;
  let orderStatusService: jest.Mocked<OrderStatusService>;

  const mockOrderService = {
    getCustomerOrders: jest.fn(),
    getStoreOrders: jest.fn(),
    findOneWithDetails: jest.fn(),
  };

  const mockOrderCreationService = {
    createOrder: jest.fn(),
  };

  const mockOrderStatusService = {
    updateStatus: jest.fn(),
    cancelOrder: jest.fn(),
  };

  const createMockOrder = (overrides = {}) => ({
    _id: generateObjectId(),
    orderNumber: 'ORD-001',
    customerId: generateObjectId(),
    storeId: generateObjectId(),
    orderStatus: OrderStatus.PENDING,
    totalAmount: 100,
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: OrderCreationService, useValue: mockOrderCreationService },
        { provide: OrderStatusService, useValue: mockOrderStatusService },
      ],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    orderService = module.get(OrderService);
    orderCreationService = module.get(OrderCreationService);
    orderStatusService = module.get(OrderStatusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order', async () => {
      const user = { profileId: generateObjectId(), role: 'customer' };
      const createDto = { items: [], deliveryAddress: {} };
      const mockOrder = createMockOrder();

      mockOrderCreationService.createOrder.mockResolvedValue(mockOrder);

      const result = await controller.createOrder(user, createDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order created successfully');
      expect(mockOrderCreationService.createOrder).toHaveBeenCalledWith(
        user.profileId,
        createDto,
      );
    });
  });

  describe('getMyOrders', () => {
    it('should return customer orders', async () => {
      const user = { profileId: generateObjectId(), role: 'customer' };
      const mockOrders = [createMockOrder(), createMockOrder()];
      const mockResult = { data: mockOrders, total: 2, page: 1, limit: 20 };

      mockOrderService.getCustomerOrders.mockResolvedValue(mockResult);

      const result = await controller.getMyOrders(user);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
    });
  });

  describe('getStoreOrders', () => {
    it('should return store orders', async () => {
      const user = { profileId: generateObjectId(), role: 'store_owner' };
      const mockOrders = [createMockOrder()];
      const mockResult = { data: mockOrders, total: 1, page: 1, limit: 20 };

      mockOrderService.getStoreOrders.mockResolvedValue(mockResult);

      const result = await controller.getStoreOrders(user);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('getOrder', () => {
    it('should return order for authorized customer', async () => {
      const customerId = generateObjectId();
      const user = { profileId: customerId, role: 'customer' };
      const mockOrder = createMockOrder({ customerId: { _id: customerId } });

      mockOrderService.findOneWithDetails.mockResolvedValue(mockOrder);

      const result = await controller.getOrder(user, mockOrder._id);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrder);
    });

    it('should throw UnauthorizedException for unauthorized customer', async () => {
      const user = { profileId: generateObjectId(), role: 'customer' };
      const mockOrder = createMockOrder({
        customerId: { _id: generateObjectId() },
      });

      mockOrderService.findOneWithDetails.mockResolvedValue(mockOrder);

      await expect(controller.getOrder(user, mockOrder._id)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should allow admin to view any order', async () => {
      const user = { profileId: generateObjectId(), role: 'admin' };
      const mockOrder = createMockOrder();

      mockOrderService.findOneWithDetails.mockResolvedValue(mockOrder);

      const result = await controller.getOrder(user, mockOrder._id);

      expect(result.success).toBe(true);
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const user = { userId: generateObjectId(), role: 'store_owner' };
      const orderId = generateObjectId();
      const updateDto = { status: OrderStatus.CONFIRMED };
      const mockOrder = createMockOrder({ orderStatus: OrderStatus.CONFIRMED });

      mockOrderStatusService.updateStatus.mockResolvedValue(mockOrder);

      const result = await controller.updateOrderStatus(
        user,
        orderId,
        updateDto,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order status updated successfully');
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order', async () => {
      const user = { userId: generateObjectId(), role: 'customer' };
      const orderId = generateObjectId();
      const cancelDto = { reason: 'Changed my mind' };
      const mockOrder = createMockOrder({ orderStatus: OrderStatus.CANCELLED });

      mockOrderStatusService.cancelOrder.mockResolvedValue(mockOrder);

      const result = await controller.cancelOrder(user, orderId, cancelDto);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Order cancelled successfully');
    });
  });

  describe('getMyOrders with filters', () => {
    it('should filter by status', async () => {
      const user = { profileId: generateObjectId(), role: 'customer' };
      const mockResult = { data: [], total: 0, page: 1, limit: 20 };

      mockOrderService.getCustomerOrders.mockResolvedValue(mockResult);

      await controller.getMyOrders(user, OrderStatus.PENDING);

      expect(mockOrderService.getCustomerOrders).toHaveBeenCalledWith(
        user.profileId,
        {
          status: OrderStatus.PENDING,
          page: 1,
          limit: 20,
        },
      );
    });

    it('should use custom page and limit', async () => {
      const user = { profileId: generateObjectId(), role: 'customer' };
      const mockResult = { data: [], total: 0, page: 2, limit: 50 };

      mockOrderService.getCustomerOrders.mockResolvedValue(mockResult);

      await controller.getMyOrders(user, undefined, 2, 50);

      expect(mockOrderService.getCustomerOrders).toHaveBeenCalledWith(
        user.profileId,
        {
          status: undefined,
          page: 2,
          limit: 50,
        },
      );
    });
  });

  describe('getStoreOrders with filters', () => {
    it('should filter by status', async () => {
      const user = { profileId: generateObjectId(), role: 'store_owner' };
      const mockResult = { data: [], total: 0, page: 1, limit: 20 };

      mockOrderService.getStoreOrders.mockResolvedValue(mockResult);

      await controller.getStoreOrders(user, OrderStatus.CONFIRMED);

      expect(mockOrderService.getStoreOrders).toHaveBeenCalledWith(
        user.profileId,
        {
          status: OrderStatus.CONFIRMED,
          page: 1,
          limit: 20,
        },
      );
    });

    it('should use custom page and limit', async () => {
      const user = { profileId: generateObjectId(), role: 'store_owner' };
      const mockResult = { data: [], total: 0, page: 3, limit: 10 };

      mockOrderService.getStoreOrders.mockResolvedValue(mockResult);

      await controller.getStoreOrders(user, undefined, 3, 10);

      expect(mockOrderService.getStoreOrders).toHaveBeenCalledWith(
        user.profileId,
        {
          status: undefined,
          page: 3,
          limit: 10,
        },
      );
    });
  });

  describe('getOrder authorization', () => {
    it('should return order for authorized store owner', async () => {
      const storeId = generateObjectId();
      const user = { profileId: storeId, role: 'store_owner' };
      const mockOrder = createMockOrder({ storeId: { _id: storeId } });

      mockOrderService.findOneWithDetails.mockResolvedValue(mockOrder);

      const result = await controller.getOrder(user, mockOrder._id);

      expect(result.success).toBe(true);
    });

    it('should throw UnauthorizedException for unauthorized store owner', async () => {
      const user = { profileId: generateObjectId(), role: 'store_owner' };
      const mockOrder = createMockOrder({
        storeId: { _id: generateObjectId() },
      });

      mockOrderService.findOneWithDetails.mockResolvedValue(mockOrder);

      await expect(controller.getOrder(user, mockOrder._id)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle customerId as string', async () => {
      const customerId = generateObjectId();
      const user = { profileId: customerId, role: 'customer' };
      const mockOrder = createMockOrder({ customerId: customerId });

      mockOrderService.findOneWithDetails.mockResolvedValue(mockOrder);

      const result = await controller.getOrder(user, mockOrder._id);

      expect(result.success).toBe(true);
    });

    it('should handle storeId as string', async () => {
      const storeId = generateObjectId();
      const user = { profileId: storeId, role: 'store_owner' };
      const mockOrder = createMockOrder({ storeId: storeId });

      mockOrderService.findOneWithDetails.mockResolvedValue(mockOrder);

      const result = await controller.getOrder(user, mockOrder._id);

      expect(result.success).toBe(true);
    });
  });
});
