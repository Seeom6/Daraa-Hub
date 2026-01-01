/**
 * Home Data Hooks
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getHomeData,
  getBanners,
  getFeaturedProducts,
  getFlashDeals,
  getNewArrivals,
  getTopStores,
} from '../services/home.service';

/**
 * Get all home page data (combined)
 */
export const useHomeData = () => {
  return useQuery({
    queryKey: ['home', 'data'],
    queryFn: getHomeData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get banners
 */
export const useBanners = () => {
  return useQuery({
    queryKey: ['home', 'banners'],
    queryFn: getBanners,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get featured products
 */
export const useHomeFeaturedProducts = (limit: number = 12) => {
  return useQuery({
    queryKey: ['home', 'featured', limit],
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get flash deals
 */
export const useFlashDeals = () => {
  return useQuery({
    queryKey: ['home', 'flash-deals'],
    queryFn: getFlashDeals,
    staleTime: 1 * 60 * 1000, // 1 minute (refresh more often for countdown)
  });
};

/**
 * Get new arrivals
 */
export const useHomeNewArrivals = (limit: number = 12) => {
  return useQuery({
    queryKey: ['home', 'new-arrivals', limit],
    queryFn: () => getNewArrivals(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get top stores
 */
export const useTopStores = (limit: number = 8) => {
  return useQuery({
    queryKey: ['home', 'top-stores', limit],
    queryFn: () => getTopStores(limit),
    staleTime: 10 * 60 * 1000,
  });
};

