import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { generateObjectId } from '../../shared/testing';

describe('CartController', () => {
  let controller: CartController;
  let cartService: jest.Mocked<CartService>;

  const mockCartService = {
    getCart: jest.fn(),
    addToCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeFromCart: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockUser = {
    userId: generateObjectId(),
    profileId: generateObjectId(),
    role: 'customer',
  };

  const mockCart = {
    _id: generateObjectId(),
    customerId: mockUser.profileId,
    items: [],
    subtotal: 0,
    total: 0,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      mockCartService.getCart.mockResolvedValue(mockCart);

      const result = await controller.getCart(mockUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCart);
      expect(mockCartService.getCart).toHaveBeenCalledWith(mockUser.profileId);
    });
  });

  describe('addToCart', () => {
    it('should add item to cart', async () => {
      const addToCartDto = { productId: generateObjectId(), quantity: 2 };
      const updatedCart = {
        ...mockCart,
        items: [{ productId: addToCartDto.productId, quantity: 2 }],
      };
      mockCartService.addToCart.mockResolvedValue(updatedCart);

      const result = await controller.addToCart(mockUser, addToCartDto as any);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Item added to cart');
      expect(result.data).toEqual(updatedCart);
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity', async () => {
      const productId = generateObjectId();
      const updateDto = { quantity: 5 };
      mockCartService.updateCartItem.mockResolvedValue(mockCart);

      const result = await controller.updateCartItem(
        mockUser,
        productId,
        undefined,
        updateDto,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart item updated');
      expect(mockCartService.updateCartItem).toHaveBeenCalledWith(
        mockUser.profileId,
        productId,
        undefined,
        updateDto,
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      const productId = generateObjectId();
      mockCartService.removeFromCart.mockResolvedValue(mockCart);

      const result = await controller.removeFromCart(
        mockUser,
        productId,
        undefined,
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Item removed from cart');
    });
  });

  describe('clearCart', () => {
    it('should clear cart', async () => {
      const emptyCart = { ...mockCart, items: [] };
      mockCartService.clearCart.mockResolvedValue(emptyCart);

      const result = await controller.clearCart(mockUser);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Cart cleared');
      expect(result.data.items).toEqual([]);
    });
  });
});
