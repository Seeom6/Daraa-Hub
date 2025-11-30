import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { OrderRepository } from './order.repository';
import { Order } from '../../../../database/schemas/order.schema';
import { MockModelFactory, generateObjectId } from '../../../shared/testing';
import { FakerDataFactory } from '../../../shared/testing/mock-data.factory';

describe('OrderRepository', () => {
  let repository: OrderRepository;
  let mockModel: any;

  beforeEach(async () => {
    mockModel = MockModelFactory.create();
    mockModel.aggregate = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderRepository,
        {
          provide: getModelToken(Order.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    repository = module.get<OrderRepository>(OrderRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByCustomerId', () => {
    it('should find orders by customer id', async () => {
      const customerId = generateObjectId();
      const mockOrders = FakerDataFactory.createMany(
        () => FakerDataFactory.createOrder({ customerId }),
        3,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await repository.findByCustomerId(customerId);

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter by status when provided', async () => {
      const customerId = generateObjectId();
      const mockOrders = [
        FakerDataFactory.createOrder({ customerId, orderStatus: 'pending' }),
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByCustomerId(customerId, {
        status: 'pending',
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findByStoreId', () => {
    it('should find orders by store id', async () => {
      const storeId = generateObjectId();
      const mockOrders = FakerDataFactory.createMany(
        () => FakerDataFactory.createOrder({ storeId }),
        5,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.findByStoreId(storeId);

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
    });
  });

  describe('findByOrderNumber', () => {
    it('should find order by order number', async () => {
      const mockOrder = FakerDataFactory.createOrder({
        orderNumber: 'ORD-12345',
      });
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await repository.findByOrderNumber('ORD-12345');

      expect(result).toEqual(mockOrder);
    });

    it('should return null if order not found', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findByOrderNumber('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const orderId = generateObjectId();
      const mockOrder = FakerDataFactory.createOrder({
        _id: orderId,
        orderStatus: 'processing',
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await repository.updateStatus(orderId, 'processing');

      expect(result).toEqual(mockOrder);
    });
  });

  describe('assignCourier', () => {
    it('should assign courier to order', async () => {
      const orderId = generateObjectId();
      const courierId = generateObjectId();
      const mockOrder = FakerDataFactory.createOrder({ courierId });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await repository.assignCourier(orderId, courierId);

      expect(result).toBeDefined();
    });
  });

  describe('getPendingOrders', () => {
    it('should get pending orders for store', async () => {
      const storeId = generateObjectId();
      const mockOrders = [
        FakerDataFactory.createOrder({ storeId, orderStatus: 'pending' }),
      ];
      mockModel.find.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockOrders),
        }),
      });

      const result = await repository.getPendingOrders(storeId);

      expect(result).toHaveLength(1);
    });
  });

  describe('getStoreOrderStats', () => {
    it('should return order statistics for store', async () => {
      const storeId = generateObjectId();
      const mockStats = [
        { _id: 'pending', count: 5, totalAmount: 500 },
        { _id: 'delivered', count: 10, totalAmount: 2000 },
      ];
      mockModel.aggregate.mockResolvedValue(mockStats);

      const result = await repository.getStoreOrderStats(storeId);

      expect(result).toEqual(mockStats);
      expect(mockModel.aggregate).toHaveBeenCalled();
    });
  });

  describe('getCustomerOrderStats', () => {
    it('should return order statistics for customer', async () => {
      const customerId = generateObjectId();
      const mockStats = [
        { totalOrders: 15, totalSpent: 3000, completedOrders: 12 },
      ];
      mockModel.aggregate.mockResolvedValue(mockStats);

      const result = await repository.getCustomerOrderStats(customerId);

      expect(result).toEqual(mockStats);
    });
  });

  describe('findByDateRange', () => {
    it('should find orders within date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const mockOrders = FakerDataFactory.createMany(
        () => FakerDataFactory.createOrder(),
        3,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await repository.findByDateRange(startDate, endDate);

      expect(result.data).toHaveLength(3);
    });

    it('should filter by storeId when provided', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const storeId = generateObjectId();
      const mockOrders = [FakerDataFactory.createOrder({ storeId })];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByDateRange(startDate, endDate, {
        storeId,
      });

      expect(result.data).toHaveLength(1);
    });

    it('should filter by customerId when provided', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');
      const customerId = generateObjectId();
      const mockOrders = [FakerDataFactory.createOrder({ customerId })];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByDateRange(startDate, endDate, {
        customerId,
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findByStoreId with status filter', () => {
    it('should filter by status when provided', async () => {
      const storeId = generateObjectId();
      const mockOrders = [
        FakerDataFactory.createOrder({ storeId, orderStatus: 'pending' }),
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByStoreId(storeId, {
        status: 'pending',
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findByCourierId', () => {
    it('should find orders by courier id', async () => {
      const courierId = generateObjectId();
      const mockOrders = FakerDataFactory.createMany(
        () => FakerDataFactory.createOrder({ courierId }),
        3,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(3),
      });

      const result = await repository.findByCourierId(courierId);

      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
    });

    it('should filter by status when provided', async () => {
      const courierId = generateObjectId();
      const mockOrders = [
        FakerDataFactory.createOrder({ courierId, orderStatus: 'in_transit' }),
      ];

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await repository.findByCourierId(courierId, {
        status: 'in_transit',
      });

      expect(result.data).toHaveLength(1);
    });
  });

  describe('findByStatus', () => {
    it('should find orders by status with default pagination', async () => {
      const mockOrders = FakerDataFactory.createMany(
        () => FakerDataFactory.createOrder({ orderStatus: 'pending' }),
        5,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(5),
      });

      const result = await repository.findByStatus('pending');

      expect(result.data).toHaveLength(5);
      expect(result.total).toBe(5);
    });

    it('should find orders by status with custom pagination', async () => {
      const mockOrders = FakerDataFactory.createMany(
        () => FakerDataFactory.createOrder({ orderStatus: 'delivered' }),
        2,
      );

      mockModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrders),
      });
      mockModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await repository.findByStatus('delivered', 2, 5);

      expect(result.data).toHaveLength(2);
    });
  });

  describe('updateStatus with statusHistory', () => {
    it('should update status with history', async () => {
      const orderId = generateObjectId();
      const mockOrder = FakerDataFactory.createOrder({
        _id: orderId,
        orderStatus: 'processing',
      });
      mockModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const statusHistory = {
        status: 'processing',
        timestamp: new Date(),
        note: 'Order is being processed',
      };
      const result = await repository.updateStatus(
        orderId,
        'processing',
        statusHistory,
      );

      expect(result).toEqual(mockOrder);
      expect(mockModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
