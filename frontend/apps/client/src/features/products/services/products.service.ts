/**
 * Products Service
 * API calls for products
 */

import { apiClient } from '@/lib/api-client';
import type {
  Product,
  ProductsResponse,
  ProductFilters,
} from '@/features/shared/types';
import { ProductStatus } from '@/features/shared/types';

/**
 * Get all products with filters
 */
export const getProducts = async (
  filters?: ProductFilters
): Promise<ProductsResponse> => {
  const { data } = await apiClient.get<ProductsResponse>('/products', {
    params: filters,
  });
  return data;
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug: string): Promise<Product> => {
  const { data } = await apiClient.get<Product>(`/products/${slug}`);
  return data;
};

/**
 * Get product by ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
};

/**
 * Search products
 */
export const searchProducts = async (
  query: string,
  filters?: Omit<ProductFilters, 'search'>
): Promise<ProductsResponse> => {
  return getProducts({ ...filters, search: query });
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (
  limit: number = 12
): Promise<ProductsResponse> => {
  return getProducts({ isFeatured: true, status: ProductStatus.ACTIVE, limit });
};

/**
 * Get new arrivals
 */
export const getNewArrivals = async (
  limit: number = 12
): Promise<ProductsResponse> => {
  return getProducts({
    status: ProductStatus.ACTIVE,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    limit,
  });
};

/**
 * Get related products
 */
export const getRelatedProducts = async (
  productId: string,
  limit: number = 8
): Promise<ProductsResponse> => {
  const { data } = await apiClient.get<ProductsResponse>(
    `/products/${productId}/related`,
    { params: { limit } }
  );
  return data;
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (
  categoryId: string,
  filters?: Omit<ProductFilters, 'categoryId'>
): Promise<ProductsResponse> => {
  return getProducts({ ...filters, categoryId, status: ProductStatus.ACTIVE });
};

/**
 * Get products by store
 */
export const getProductsByStore = async (
  storeId: string,
  filters?: Omit<ProductFilters, 'storeId'>
): Promise<ProductsResponse> => {
  return getProducts({ ...filters, storeId, status: ProductStatus.ACTIVE });
};

/**
 * Get best selling products
 */
export const getBestSellingProducts = async (
  limit: number = 12
): Promise<ProductsResponse> => {
  return getProducts({
    status: ProductStatus.ACTIVE,
    sortBy: 'soldCount',
    sortOrder: 'desc',
    limit,
  });
};

/**
 * Get top rated products
 */
export const getTopRatedProducts = async (
  limit: number = 12
): Promise<ProductsResponse> => {
  return getProducts({
    status: ProductStatus.ACTIVE,
    sortBy: 'rating',
    sortOrder: 'desc',
    limit,
  });
};

