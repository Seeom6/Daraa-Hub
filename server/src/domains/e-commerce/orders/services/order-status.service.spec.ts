import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Types } from 'mongoose';
import { OrderStatusService } from './order-status.service';
import { OrderRepository } from '../repositories/order.repository';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { CommissionService } from '../../../shared/commission/services/commission.service';
import { WalletService } from '../../../shared/wallet/services/wallet.service';
import {
  generateObjectId,
  createMockEventEmitter,
} from '../../../shared/testing';
import { OrderStatus } from '../../../../database/schemas/order.schema';

describe('OrderStatusService', () => {
  let service: OrderStatusService;
  let orderRepository: jest.Mocked<OrderRepository>;
  let inventoryRepository: jest.Mocked<InventoryRepository>;
  let commissionService: jest.Mocked<CommissionService>;
  let walletService: jest.Mocked<WalletService>;

  const mockOrderRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockInventoryRepository = {
    getModel: jest.fn(),
  };

  const mockCommissionService = {
    calculateOrderCommission: jest.fn(),
  };

  const mockWalletService = {
    addEarnings: jest.fn(),
    refundToWallet: jest.fn(),
  };

  const createMockOrder = (overrides = {}) => ({
    _id: new Types.ObjectId(),
    orderNumber: 'ORD-001',
    orderStatus: OrderStatus.PENDING,
    storeId: new Types.ObjectId(),
    customerId: new Types.ObjectId(),
    items: [],
    subtotal: 100,
    deliveryFee: 10,
    totalAmount: 110,
    walletAmountPaid: 0,
    statusHistory: [],
    save: jest.fn().mockResolvedValue({}),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderStatusService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: InventoryRepository, useValue: mockInventoryRepository },
        { provide: CommissionService, useValue: mockCommissionService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: EventEmitter2, useValue: createMockEventEmitter() },
      ],
    }).compile();

    service = module.get<OrderStatusService>(OrderStatusService);
    orderRepository = module.get(OrderRepository);
    inventoryRepository = module.get(InventoryRepository);
    commissionService = module.get(CommissionService);
    walletService = module.get(WalletService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateStatus', () => {
    it('should update order status successfully', async () => {
      const orderId = generateObjectId();
      const userId = generateObjectId();
      const mockOrder = createMockOrder({ orderStatus: OrderStatus.PENDING });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.updateStatus(
        orderId,
        { status: OrderStatus.CONFIRMED },
        userId,
      );

      expect(mockOrder.save).toHaveBeenCalled();
      expect(mockOrder.orderStatus).toBe(OrderStatus.CONFIRMED);
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateStatus(
          generateObjectId(),
          { status: OrderStatus.CONFIRMED },
          generateObjectId(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const mockOrder = createMockOrder({ orderStatus: OrderStatus.DELIVERED });
      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        service.updateStatus(
          generateObjectId(),
          { status: OrderStatus.PENDING },
          generateObjectId(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should process commission when order is delivered', async () => {
      const mockOrder = createMockOrder({
        orderStatus: OrderStatus.DELIVERING,
      });
      const mockCommission = {
        _id: new Types.ObjectId(),
        storeEarnings: 90,
        courierEarnings: 10,
        platformFee: 10,
      };

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockCommissionService.calculateOrderCommission.mockResolvedValue(
        mockCommission,
      );
      mockWalletService.addEarnings.mockResolvedValue({});

      await service.updateStatus(
        generateObjectId(),
        { status: OrderStatus.DELIVERED },
        generateObjectId(),
      );

      expect(mockCommissionService.calculateOrderCommission).toHaveBeenCalled();
      expect(mockWalletService.addEarnings).toHaveBeenCalled();
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order successfully', async () => {
      const orderId = generateObjectId();
      const userId = generateObjectId();
      const mockOrder = createMockOrder({
        orderStatus: OrderStatus.PENDING,
        items: [],
      });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      const result = await service.cancelOrder(
        orderId,
        { reason: 'Customer request' },
        userId,
      );

      expect(mockOrder.save).toHaveBeenCalled();
      expect(mockOrder.orderStatus).toBe(OrderStatus.CANCELLED);
    });

    it('should throw NotFoundException when order not found', async () => {
      mockOrderRepository.findById.mockResolvedValue(null);

      await expect(
        service.cancelOrder(
          generateObjectId(),
          { reason: 'Test' },
          generateObjectId(),
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when order is already delivered', async () => {
      const mockOrder = createMockOrder({ orderStatus: OrderStatus.DELIVERED });
      mockOrderRepository.findById.mockResolvedValue(mockOrder);

      await expect(
        service.cancelOrder(
          generateObjectId(),
          { reason: 'Test' },
          generateObjectId(),
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should refund wallet payment when applicable', async () => {
      const mockOrder = createMockOrder({
        orderStatus: OrderStatus.PENDING,
        walletAmountPaid: 50,
        items: [],
      });

      mockOrderRepository.findById.mockResolvedValue(mockOrder);
      mockWalletService.refundToWallet.mockResolvedValue({});

      await service.cancelOrder(
        generateObjectId(),
        { reason: 'Test' },
        generateObjectId(),
      );

      expect(mockWalletService.refundToWallet).toHaveBeenCalled();
    });
  });
});
