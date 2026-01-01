import { apiClient } from '@/lib/api-client';
import type { Product } from '@/features/shared/types';

export interface WishlistResponse {
  products: Product[];
  total: number;
}

export const wishlistService = {
  /**
   * Get wishlist
   */
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },

  /**
   * Add to wishlist
   */
  addToWishlist: async (productId: string): Promise<void> => {
    await apiClient.post(`/wishlist/${productId}`);
  },

  /**
   * Remove from wishlist
   */
  removeFromWishlist: async (productId: string): Promise<void> => {
    await apiClient.delete(`/wishlist/${productId}`);
  },

  /**
   * Check if product is in wishlist
   */
  isInWishlist: async (productId: string): Promise<boolean> => {
    const response = await apiClient.get(`/wishlist/check/${productId}`);
    return response.data.isInWishlist;
  },
};

