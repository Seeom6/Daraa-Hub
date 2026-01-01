/**
 * Products Hooks
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getProducts,
  getProductBySlug,
  getProductById,
  searchProducts,
  getFeaturedProducts,
  getNewArrivals,
  getRelatedProducts,
  getProductsByCategory,
  getProductsByStore,
  getBestSellingProducts,
  getTopRatedProducts,
} from '../services/products.service';
import type { ProductFilters } from '@/features/shared/types';

/**
 * Get all products with filters
 */
export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => getProducts(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get product by slug
 */
export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get product by ID
 */
export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', 'id', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Search products
 */
export const useSearchProducts = (
  query: string,
  filters?: Omit<ProductFilters, 'search'>
) => {
  return useQuery({
    queryKey: ['products', 'search', query, filters],
    queryFn: () => searchProducts(query, filters),
    enabled: !!query && query.length >= 2,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Get featured products
 */
export const useFeaturedProducts = (limit: number = 12) => {
  return useQuery({
    queryKey: ['products', 'featured', limit],
    queryFn: () => getFeaturedProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get new arrivals
 */
export const useNewArrivals = (limit: number = 12) => {
  return useQuery({
    queryKey: ['products', 'new-arrivals', limit],
    queryFn: () => getNewArrivals(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get related products
 */
export const useRelatedProducts = (productId: string, limit: number = 8) => {
  return useQuery({
    queryKey: ['products', 'related', productId, limit],
    queryFn: () => getRelatedProducts(productId, limit),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get products by category
 */
export const useProductsByCategory = (
  categoryId: string,
  filters?: Omit<ProductFilters, 'categoryId'>
) => {
  return useQuery({
    queryKey: ['products', 'category', categoryId, filters],
    queryFn: () => getProductsByCategory(categoryId, filters),
    enabled: !!categoryId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get products by store
 */
export const useProductsByStore = (
  storeId: string,
  filters?: Omit<ProductFilters, 'storeId'>
) => {
  return useQuery({
    queryKey: ['products', 'store', storeId, filters],
    queryFn: () => getProductsByStore(storeId, filters),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000,
  });
};

/**
 * Get best selling products
 */
export const useBestSellingProducts = (limit: number = 12) => {
  return useQuery({
    queryKey: ['products', 'best-selling', limit],
    queryFn: () => getBestSellingProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get top rated products
 */
export const useTopRatedProducts = (limit: number = 12) => {
  return useQuery({
    queryKey: ['products', 'top-rated', limit],
    queryFn: () => getTopRatedProducts(limit),
    staleTime: 5 * 60 * 1000,
  });
};

