import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreationService } from './order-creation.service';
import { OrderRepository } from '../repositories/order.repository';
import { CartRepository } from '../../cart/repositories/cart.repository';
import { InventoryRepository } from '../../inventory/repositories/inventory.repository';
import { StoreOwnerProfileRepository } from '../../../shared/accounts/repositories/store-owner-profile.repository';
import { StoreSettingsService } from '../../../shared/store-settings/services/store-settings.service';
import { WalletService } from '../../../shared/wallet/services/wallet.service';
import { DeliveryZoneService } from '../../../shared/delivery-zones/services/delivery-zone.service';
import { generateObjectId } from '../../../shared/testing';
import { PaymentMethod } from '../../../../database/schemas/order.schema';

describe('OrderCreationService', () => {
  let service: OrderCreationService;

  const mockCartModel = { findOne: jest.fn() };
  const mockInventoryModel = { findOne: jest.fn() };
  const mockOrderModel = { countDocuments: jest.fn() };

  const mockOrderRepository = {
    create: jest.fn(),
    getModel: jest.fn().mockReturnValue(mockOrderModel),
  };

  const mockCartRepository = {
    getModel: jest.fn().mockReturnValue(mockCartModel),
  };

  const mockInventoryRepository = {
    getModel: jest.fn().mockReturnValue(mockInventoryModel),
  };

  const mockStoreOwnerProfileRepository = {
    findById: jest.fn(),
  };

  const mockStoreSettingsService = {
    calculateShippingFee: jest.fn(),
  };

  const mockWalletService = {
    getWallet: jest.fn(),
    payFromWallet: jest.fn(),
  };

  const mockDeliveryZoneService = {
    calculateDeliveryFee: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const customerId = generateObjectId();
  const storeId = generateObjectId();
  const productId = generateObjectId();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderCreationService,
        { provide: OrderRepository, useValue: mockOrderRepository },
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: InventoryRepository, useValue: mockInventoryRepository },
        {
          provide: StoreOwnerProfileRepository,
          useValue: mockStoreOwnerProfileRepository,
        },
        { provide: StoreSettingsService, useValue: mockStoreSettingsService },
        { provide: WalletService, useValue: mockWalletService },
        { provide: DeliveryZoneService, useValue: mockDeliveryZoneService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<OrderCreationService>(OrderCreationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    const createOrderDto = {
      storeId,
      paymentMethod: PaymentMethod.CASH,
      deliveryAddress: {
        fullName: 'Test User',
        phone: '+963991234567',
        city: 'Damascus',
        area: 'Mazzeh',
        street: 'Test Street',
      },
    };

    it('should throw if cart is empty', async () => {
      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.createOrder(customerId, createOrderDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if no items from store in cart', async () => {
      const cart = {
        items: [{ storeId: generateObjectId(), quantity: 1 }],
      };
      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });

      await expect(
        service.createOrder(customerId, createOrderDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if store not found', async () => {
      const cart = {
        items: [
          {
            storeId,
            productId: { _id: productId, name: 'Test' },
            quantity: 1,
            price: 100,
          },
        ],
      };
      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue(null);

      await expect(
        service.createOrder(customerId, createOrderDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if store is not active', async () => {
      const cart = {
        items: [
          {
            storeId,
            productId: { _id: productId, name: 'Test' },
            quantity: 1,
            price: 100,
          },
        ],
      };
      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: false,
      });

      await expect(
        service.createOrder(customerId, createOrderDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if insufficient stock', async () => {
      const cart = {
        items: [
          {
            storeId,
            productId: { _id: productId, name: 'Test' },
            quantity: 10,
            price: 100,
          },
        ],
      };
      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ availableQuantity: 5 }),
      });

      await expect(
        service.createOrder(customerId, createOrderDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if inventory not found', async () => {
      const cart = {
        items: [
          {
            storeId,
            productId: { _id: productId, name: 'Test' },
            quantity: 1,
            price: 100,
          },
        ],
      };
      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.createOrder(customerId, createOrderDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create order successfully with cash payment', async () => {
      const cart = {
        items: [
          {
            storeId,
            productId: {
              _id: productId,
              name: 'Test',
              mainImage: 'img.jpg',
              sku: 'SKU1',
            },
            variantId: null,
            quantity: 2,
            price: 100,
            pointsPrice: 0,
          },
        ],
        save: jest.fn(),
      };
      const inventory = {
        quantity: 10,
        availableQuantity: 10,
        reservedQuantity: 0,
        save: jest.fn(),
      };
      const createdOrder = {
        _id: generateObjectId(),
        orderNumber: 'ORD-241129-0001',
      };

      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inventory),
      });
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(50);
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockOrderRepository.create.mockResolvedValue(createdOrder);

      const result = await service.createOrder(
        customerId,
        createOrderDto as any,
      );

      expect(result).toEqual(createdOrder);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'order.created',
        expect.any(Object),
      );
      expect(cart.save).toHaveBeenCalled();
    });

    it('should use delivery zone for fee calculation when zoneId provided', async () => {
      const zoneId = generateObjectId();
      const dtoWithZone = {
        ...createOrderDto,
        deliveryAddress: { ...createOrderDto.deliveryAddress, zoneId },
      };
      const cart = {
        items: [
          {
            storeId,
            productId: {
              _id: productId,
              name: 'Test',
              images: ['img.jpg'],
              sku: 'SKU1',
            },
            variantId: null,
            quantity: 1,
            price: 100,
            pointsPrice: 0,
          },
        ],
        save: jest.fn(),
      };
      const inventory = {
        quantity: 10,
        availableQuantity: 10,
        reservedQuantity: 0,
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inventory),
      });
      mockDeliveryZoneService.calculateDeliveryFee.mockResolvedValue({
        fee: 75,
      });
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockOrderRepository.create.mockResolvedValue({ _id: generateObjectId() });

      await service.createOrder(customerId, dtoWithZone as any);

      expect(mockDeliveryZoneService.calculateDeliveryFee).toHaveBeenCalledWith(
        storeId,
        zoneId,
        100,
      );
    });

    it('should handle wallet payment when payFromWallet is true', async () => {
      const dtoWithWallet = {
        ...createOrderDto,
        payFromWallet: true,
        walletAmount: 100,
      };
      const cart = {
        items: [
          {
            storeId,
            productId: {
              _id: productId,
              name: 'Test',
              mainImage: 'img.jpg',
              sku: 'SKU1',
            },
            variantId: null,
            quantity: 1,
            price: 100,
            pointsPrice: 0,
          },
        ],
        save: jest.fn(),
      };
      const inventory = {
        quantity: 10,
        availableQuantity: 10,
        reservedQuantity: 0,
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inventory),
      });
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(50);
      mockWalletService.getWallet.mockResolvedValue({ balance: 200 });
      mockWalletService.payFromWallet.mockResolvedValue({});
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockOrderRepository.create.mockResolvedValue({ _id: generateObjectId() });

      await service.createOrder(customerId, dtoWithWallet as any);

      expect(mockWalletService.getWallet).toHaveBeenCalledWith(customerId);
      expect(mockWalletService.payFromWallet).toHaveBeenCalled();
    });

    it('should throw if wallet balance is insufficient', async () => {
      const dtoWithWallet = {
        ...createOrderDto,
        paymentMethod: PaymentMethod.WALLET,
      };
      const cart = {
        items: [
          {
            storeId,
            productId: {
              _id: productId,
              name: 'Test',
              mainImage: 'img.jpg',
              sku: 'SKU1',
            },
            variantId: null,
            quantity: 1,
            price: 100,
            pointsPrice: 0,
          },
        ],
        save: jest.fn(),
      };
      const inventory = {
        quantity: 10,
        availableQuantity: 10,
        reservedQuantity: 0,
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inventory),
      });
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(50);
      mockWalletService.getWallet.mockResolvedValue({ balance: 10 });
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await expect(
        service.createOrder(customerId, dtoWithWallet as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle variant in cart item', async () => {
      const variantId = generateObjectId();
      const cart = {
        items: [
          {
            storeId,
            productId: {
              _id: productId,
              name: 'Test',
              mainImage: 'img.jpg',
              sku: 'SKU1',
            },
            variantId: { _id: variantId, sku: 'VAR-SKU' },
            quantity: 1,
            price: 150,
            pointsPrice: 0,
          },
        ],
        save: jest.fn(),
      };
      const inventory = {
        quantity: 10,
        availableQuantity: 10,
        reservedQuantity: 0,
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inventory),
      });
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(50);
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockOrderRepository.create.mockResolvedValue({ _id: generateObjectId() });

      await service.createOrder(customerId, createOrderDto as any);

      expect(mockInventoryModel.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ variantId: variantId }),
      );
    });

    it('should handle mixed payment method', async () => {
      const dtoWithMixed = {
        ...createOrderDto,
        paymentMethod: PaymentMethod.MIXED,
        walletAmount: 50,
      };
      const cart = {
        items: [
          {
            storeId,
            productId: {
              _id: productId,
              name: 'Test',
              mainImage: 'img.jpg',
              sku: 'SKU1',
            },
            variantId: null,
            quantity: 1,
            price: 100,
            pointsPrice: 0,
          },
        ],
        save: jest.fn(),
      };
      const inventory = {
        quantity: 10,
        availableQuantity: 10,
        reservedQuantity: 0,
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inventory),
      });
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(50);
      mockWalletService.getWallet.mockResolvedValue({ balance: 100 });
      mockWalletService.payFromWallet.mockResolvedValue({});
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockOrderRepository.create.mockResolvedValue({ _id: generateObjectId() });

      await service.createOrder(customerId, dtoWithMixed as any);

      expect(mockWalletService.payFromWallet).toHaveBeenCalled();
    });

    it('should handle full wallet payment', async () => {
      const dtoWithWallet = {
        ...createOrderDto,
        paymentMethod: PaymentMethod.WALLET,
      };
      const cart = {
        items: [
          {
            storeId,
            productId: {
              _id: productId,
              name: 'Test',
              mainImage: 'img.jpg',
              sku: 'SKU1',
            },
            variantId: null,
            quantity: 1,
            price: 100,
            pointsPrice: 0,
          },
        ],
        save: jest.fn(),
      };
      const inventory = {
        quantity: 10,
        availableQuantity: 10,
        reservedQuantity: 0,
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inventory),
      });
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(50);
      mockWalletService.getWallet.mockResolvedValue({ balance: 200 });
      mockWalletService.payFromWallet.mockResolvedValue({});
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockOrderRepository.create.mockResolvedValue({ _id: generateObjectId() });

      await service.createOrder(customerId, dtoWithWallet as any);

      // Should set payment status to PAID when wallet covers full amount
      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ paymentMethod: PaymentMethod.WALLET }),
      );
    });

    it('should include appliedCoupon when provided', async () => {
      const couponId = generateObjectId();
      const dtoWithCoupon = {
        ...createOrderDto,
        appliedCoupon: couponId,
      };
      const cart = {
        items: [
          {
            storeId,
            productId: {
              _id: productId,
              name: 'Test',
              mainImage: 'img.jpg',
              sku: 'SKU1',
            },
            variantId: null,
            quantity: 1,
            price: 100,
            pointsPrice: 0,
          },
        ],
        save: jest.fn(),
      };
      const inventory = {
        quantity: 10,
        availableQuantity: 10,
        reservedQuantity: 0,
        save: jest.fn(),
      };

      mockCartModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(cart),
      });
      mockStoreOwnerProfileRepository.findById.mockResolvedValue({
        isStoreActive: true,
      });
      mockInventoryModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(inventory),
      });
      mockStoreSettingsService.calculateShippingFee.mockResolvedValue(50);
      mockOrderModel.countDocuments.mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });
      mockOrderRepository.create.mockResolvedValue({ _id: generateObjectId() });

      await service.createOrder(customerId, dtoWithCoupon as any);

      expect(mockOrderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ appliedCoupon: expect.any(Object) }),
      );
    });
  });
});
