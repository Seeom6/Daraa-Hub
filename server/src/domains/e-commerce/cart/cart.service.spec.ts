import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartRepository } from './repositories/cart.repository';
import { ProductRepository } from '../products/repositories/product.repository';
import { ProductVariantRepository } from '../products/repositories/product-variant.repository';
import { InventoryRepository } from '../inventory/repositories/inventory.repository';
import { generateObjectId } from '../../shared/testing';
import { Types } from 'mongoose';

describe('CartService', () => {
  let service: CartService;
  let cartRepository: jest.Mocked<CartRepository>;
  let productRepository: jest.Mocked<ProductRepository>;
  let inventoryRepository: jest.Mocked<InventoryRepository>;

  const mockCartRepository = {
    findByCustomerId: jest.fn(),
    create: jest.fn(),
    updateItemQuantity: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockProductRepository = {
    findById: jest.fn(),
  };

  const mockProductVariantRepository = {
    findById: jest.fn(),
  };

  const mockInventoryRepository = {
    checkAvailability: jest.fn(),
  };

  const customerId = generateObjectId();
  const productId = generateObjectId();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CartRepository, useValue: mockCartRepository },
        { provide: ProductRepository, useValue: mockProductRepository },
        {
          provide: ProductVariantRepository,
          useValue: mockProductVariantRepository,
        },
        { provide: InventoryRepository, useValue: mockInventoryRepository },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    cartRepository = module.get(CartRepository);
    productRepository = module.get(ProductRepository);
    inventoryRepository = module.get(InventoryRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateCart', () => {
    it('should return existing cart', async () => {
      const existingCart = { _id: generateObjectId(), customerId, items: [] };
      mockCartRepository.findByCustomerId.mockResolvedValue(existingCart);

      const result = await service.getOrCreateCart(customerId);

      expect(result).toEqual(existingCart);
      expect(mockCartRepository.create).not.toHaveBeenCalled();
    });

    it('should create new cart if not exists', async () => {
      const newCart = { _id: generateObjectId(), customerId, items: [] };
      mockCartRepository.findByCustomerId.mockResolvedValue(null);
      mockCartRepository.create.mockResolvedValue(newCart);

      const result = await service.getOrCreateCart(customerId);

      expect(result).toEqual(newCart);
      expect(mockCartRepository.create).toHaveBeenCalled();
    });
  });

  describe('addToCart', () => {
    const addToCartDto = { productId, quantity: 2 };
    const mockProduct = {
      _id: productId,
      status: 'active',
      price: 100,
      storeId: generateObjectId(),
    };
    const mockCart = {
      _id: generateObjectId(),
      customerId,
      items: [],
      save: jest.fn(),
    };

    it('should add item to cart', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockInventoryRepository.checkAvailability.mockResolvedValue(true);
      mockCartRepository.findByCustomerId.mockResolvedValue(mockCart);

      await service.addToCart(customerId, addToCartDto as any);

      expect(mockCart.save).toHaveBeenCalled();
    });

    it('should throw if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(
        service.addToCart(customerId, addToCartDto as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw if product is not active', async () => {
      mockProductRepository.findById.mockResolvedValue({
        ...mockProduct,
        status: 'inactive',
      });

      await expect(
        service.addToCart(customerId, addToCartDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if insufficient stock', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockInventoryRepository.checkAvailability.mockResolvedValue(false);

      await expect(
        service.addToCart(customerId, addToCartDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const updatedCart = { _id: generateObjectId(), items: [] };
      mockInventoryRepository.checkAvailability.mockResolvedValue(true);
      mockCartRepository.updateItemQuantity.mockResolvedValue(updatedCart);
      mockCartRepository.findByCustomerId.mockResolvedValue(updatedCart);

      const result = await service.updateCartItem(
        customerId,
        productId,
        undefined,
        { quantity: 5 },
      );

      expect(result).toEqual(updatedCart);
    });

    it('should throw if insufficient stock', async () => {
      mockInventoryRepository.checkAvailability.mockResolvedValue(false);

      await expect(
        service.updateCartItem(customerId, productId, undefined, {
          quantity: 100,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw if cart or item not found', async () => {
      mockInventoryRepository.checkAvailability.mockResolvedValue(true);
      mockCartRepository.updateItemQuantity.mockResolvedValue(null);

      await expect(
        service.updateCartItem(customerId, productId, undefined, {
          quantity: 5,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const cart = { _id: generateObjectId(), items: [] };
      mockCartRepository.removeItem.mockResolvedValue(undefined);
      mockCartRepository.findByCustomerId.mockResolvedValue(cart);

      const result = await service.removeFromCart(customerId, productId);

      expect(result).toEqual(cart);
      expect(mockCartRepository.removeItem).toHaveBeenCalledWith(
        customerId,
        productId,
        undefined,
      );
    });
  });

  describe('clearCart', () => {
    it('should clear cart', async () => {
      const clearedCart = { _id: generateObjectId(), items: [] };
      mockCartRepository.clearCart.mockResolvedValue(clearedCart);

      const result = await service.clearCart(customerId);

      expect(result).toEqual(clearedCart);
    });
  });
});
