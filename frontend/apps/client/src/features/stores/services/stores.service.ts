import { apiClient } from '@/lib/api-client';
import type { Store, StoresResponse, StoreFilters } from '@/features/shared/types/store.types';
import type { ProductsResponse } from '@/features/shared/types/product.types';
import type { ReviewsResponse } from '@/features/shared/types/review.types';

const STORES_BASE_URL = '/stores';

export const storesService = {
  /**
   * Get all stores
   */
  getStores: async (filters?: StoreFilters): Promise<StoresResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sort) params.append('sort', filters.sort);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get<StoresResponse>(
      `${STORES_BASE_URL}?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get store by slug
   */
  getStoreBySlug: async (slug: string): Promise<Store> => {
    const response = await apiClient.get<{ store: Store }>(`${STORES_BASE_URL}/${slug}`);
    return response.data.store;
  },

  /**
   * Get store products
   */
  getStoreProducts: async (
    slug: string,
    filters?: { page?: number; limit?: number; category?: string; sort?: string }
  ): Promise<ProductsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.category) params.append('category', filters.category);
    if (filters?.sort) params.append('sort', filters.sort);

    const response = await apiClient.get<ProductsResponse>(
      `${STORES_BASE_URL}/${slug}/products?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get store reviews
   */
  getStoreReviews: async (
    slug: string,
    filters?: { page?: number; limit?: number }
  ): Promise<ReviewsResponse> => {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await apiClient.get<ReviewsResponse>(
      `${STORES_BASE_URL}/${slug}/reviews?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Follow store
   */
  followStore: async (id: string): Promise<void> => {
    await apiClient.post(`${STORES_BASE_URL}/${id}/follow`);
  },

  /**
   * Unfollow store
   */
  unfollowStore: async (id: string): Promise<void> => {
    await apiClient.delete(`${STORES_BASE_URL}/${id}/unfollow`);
  },

  /**
   * Get following stores
   */
  getFollowingStores: async (): Promise<StoresResponse> => {
    const response = await apiClient.get<StoresResponse>(`${STORES_BASE_URL}/following`);
    return response.data;
  },
};

