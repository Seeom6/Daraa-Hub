/**
 * Categories Service
 * API calls for categories
 */

import { apiClient } from '@/lib/api-client';
import type {
  Category,
  CategoriesResponse,
  CategoryWithProducts,
  CategoryFilters,
} from '@/features/shared/types';

/**
 * Get all categories
 */
export const getCategories = async (
  filters?: CategoryFilters
): Promise<CategoriesResponse> => {
  const { data } = await apiClient.get<CategoriesResponse>('/categories', {
    params: filters,
  });
  return data;
};

/**
 * Get category by slug
 */
export const getCategoryBySlug = async (
  slug: string
): Promise<Category> => {
  const { data } = await apiClient.get<Category>(`/categories/${slug}`);
  return data;
};

/**
 * Get category with products
 */
export const getCategoryProducts = async (
  slug: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
): Promise<CategoryWithProducts> => {
  const { data } = await apiClient.get<CategoryWithProducts>(
    `/categories/${slug}/products`,
    { params }
  );
  return data;
};

/**
 * Get root categories (level 0)
 */
export const getRootCategories = async (): Promise<CategoriesResponse> => {
  return getCategories({ level: 0, isActive: true });
};

/**
 * Get subcategories of a category
 */
export const getSubcategories = async (
  parentId: string
): Promise<CategoriesResponse> => {
  return getCategories({ parentCategory: parentId, isActive: true });
};

