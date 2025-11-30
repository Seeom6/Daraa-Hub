import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderRepository } from '../repositories/order.repository';
import { generateObjectId } from '../../../shared/testing';
import { OrderStatus } from '../../../../database/schemas/order.schema';

describe('OrderService', () => {
  let service: OrderService;

  const mockOrderModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOrderRepository = {
    findById: jest.fn(),
    getModel: jest.fn().mockReturnValue(mockOrderModel),
    count: jest.fn(),
  };

  const orderId = generateObjectId();
  const customerId = generateObjectId();
  const storeId = generateObjectId();

  const mockOrder = {
    _id: orderId,
    orderNumber: 'ORD-241128-0001',
    customerId,
    storeId,
    orderStatus: OrderStatus.PENDING,
    total: 50000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: mockOrderRepository },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return order', async () => {
      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.findOne(orderId);

      expect(result).toEqual(mockOrder);
    });

    it('should throw if not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(orderId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneWithDetails', () => {
    it('should return order with populated fields', async () => {
      mockOrderModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.findOneWithDetails(orderId);

      expect(result).toEqual(mockOrder);
    });
  });

  describe('getCustomerOrders', () => {
    it('should return customer orders', async () => {
      mockOrderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });
      mockOrderRepository.count.mockResolvedValue(1);

      const result = await service.getCustomerOrders(customerId, {});

      expect(result.data).toEqual([mockOrder]);
      expect(result.total).toBe(1);
    });
  });

  describe('getStoreOrders', () => {
    it('should return store orders', async () => {
      mockOrderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });
      mockOrderRepository.count.mockResolvedValue(1);

      const result = await service.getStoreOrders(storeId, {});

      expect(result.data).toEqual([mockOrder]);
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders', async () => {
      mockOrderModel.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockOrder]),
      });
      mockOrderRepository.count.mockResolvedValue(1);

      const result = await service.getAllOrders({});

      expect(result.data).toEqual([mockOrder]);
    });
  });

  describe('findByOrderNumber', () => {
    it('should return order by number', async () => {
      mockOrderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockOrder),
      });

      const result = await service.findByOrderNumber('ORD-241128-0001');

      expect(result).toEqual(mockOrder);
    });

    it('should throw if not found', async () => {
      mockOrderModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findByOrderNumber('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
