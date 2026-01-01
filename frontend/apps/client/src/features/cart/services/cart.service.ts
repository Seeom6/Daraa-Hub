import { apiClient } from '@/lib/api-client';
import type {
  Cart,
  CartResponse,
  AddToCartInput,
  UpdateCartItemInput,
  ApplyCouponInput,
} from '../types/cart.types';

const CART_BASE_URL = '/cart';

export const cartService = {
  /**
   * Get current cart
   */
  getCart: async (): Promise<Cart> => {
    const response = await apiClient.get<CartResponse>(CART_BASE_URL);
    return response.data.cart;
  },

  /**
   * Add item to cart
   */
  addToCart: async (input: AddToCartInput): Promise<Cart> => {
    const response = await apiClient.post<CartResponse>(`${CART_BASE_URL}/items`, input);
    return response.data.cart;
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (productId: string, input: UpdateCartItemInput): Promise<Cart> => {
    const response = await apiClient.put<CartResponse>(
      `${CART_BASE_URL}/items/${productId}`,
      input
    );
    return response.data.cart;
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (productId: string): Promise<Cart> => {
    const response = await apiClient.delete<CartResponse>(
      `${CART_BASE_URL}/items/${productId}`
    );
    return response.data.cart;
  },

  /**
   * Clear cart
   */
  clearCart: async (): Promise<void> => {
    await apiClient.delete(CART_BASE_URL);
  },

  /**
   * Apply coupon to cart
   */
  applyCoupon: async (input: ApplyCouponInput): Promise<Cart> => {
    const response = await apiClient.post<CartResponse>(
      `${CART_BASE_URL}/apply-coupon`,
      input
    );
    return response.data.cart;
  },

  /**
   * Remove coupon from cart
   */
  removeCoupon: async (): Promise<Cart> => {
    const response = await apiClient.delete<CartResponse>(
      `${CART_BASE_URL}/remove-coupon`
    );
    return response.data.cart;
  },
};

