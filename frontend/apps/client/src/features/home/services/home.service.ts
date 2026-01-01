/**
 * Home Service
 * API calls for home page data
 */

import { apiClient } from '@/lib/api-client';
import type {
  HomeDataResponse,
  BannersResponse,
  FlashDealsResponse,
  StoresResponse,
} from '@/features/shared/types';

/**
 * Get all home page data (combined)
 */
export const getHomeData = async (): Promise<HomeDataResponse> => {
  const { data } = await apiClient.get<HomeDataResponse>('/home');
  return data;
};

/**
 * Get banners
 */
export const getBanners = async (): Promise<BannersResponse> => {
  const { data } = await apiClient.get<BannersResponse>('/home/banners');
  return data;
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit: number = 12) => {
  const { data } = await apiClient.get('/home/featured', {
    params: { limit },
  });
  return data;
};

/**
 * Get flash deals
 */
export const getFlashDeals = async (): Promise<FlashDealsResponse> => {
  const { data } = await apiClient.get<FlashDealsResponse>('/home/flash-deals');
  return data;
};

/**
 * Get new arrivals
 */
export const getNewArrivals = async (limit: number = 12) => {
  const { data } = await apiClient.get('/home/new-arrivals', {
    params: { limit },
  });
  return data;
};

/**
 * Get top stores
 */
export const getTopStores = async (limit: number = 8): Promise<StoresResponse> => {
  const { data } = await apiClient.get<StoresResponse>('/stores', {
    params: {
      sortBy: 'rating',
      sortOrder: 'desc',
      limit,
      isActive: true,
    },
  });
  return data;
};

