/**
 * Categories Hooks
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryProducts,
  getRootCategories,
  getSubcategories,
} from '../services/categories.service';
import type { CategoryFilters } from '@/features/shared/types';

/**
 * Get all categories
 */
export const useCategories = (filters?: CategoryFilters) => {
  return useQuery({
    queryKey: ['categories', filters],
    queryFn: () => getCategories(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get category by slug
 */
export const useCategory = (slug: string) => {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: () => getCategoryBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Get category with products
 */
export const useCategoryProducts = (
  slug: string,
  params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) => {
  return useQuery({
    queryKey: ['category-products', slug, params],
    queryFn: () => getCategoryProducts(slug, params),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Get root categories (level 0)
 */
export const useRootCategories = () => {
  return useQuery({
    queryKey: ['categories', 'root'],
    queryFn: getRootCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Get subcategories
 */
export const useSubcategories = (parentId: string) => {
  return useQuery({
    queryKey: ['categories', 'subcategories', parentId],
    queryFn: () => getSubcategories(parentId),
    enabled: !!parentId,
    staleTime: 5 * 60 * 1000,
  });
};

