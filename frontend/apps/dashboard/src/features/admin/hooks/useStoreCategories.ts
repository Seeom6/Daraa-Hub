/**
 * Store Categories Module - React Query Hooks
 * Custom hooks for store categories data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { CreateStoreCategoryData, UpdateStoreCategoryData } from '../types/stores.types';
import * as categoriesApi from '../api/store-categories.api';

// ============================================================================
// Query Keys
// ============================================================================

export const storeCategoriesKeys = {
  all: ['store-categories'] as const,
  lists: () => [...storeCategoriesKeys.all, 'list'] as const,
  list: () => [...storeCategoriesKeys.lists()] as const,
  details: () => [...storeCategoriesKeys.all, 'detail'] as const,
  detail: (id: string) => [...storeCategoriesKeys.details(), id] as const,
  subcategories: (id: string) => [...storeCategoriesKeys.all, 'subcategories', id] as const,
  statistics: (id: string) => [...storeCategoriesKeys.all, 'statistics', id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all store categories
 */
export function useStoreCategories() {
  return useQuery({
    queryKey: storeCategoriesKeys.list(),
    queryFn: categoriesApi.getStoreCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes (categories don't change often)
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Get store category by ID
 */
export function useStoreCategory(categoryId: string) {
  return useQuery({
    queryKey: storeCategoriesKeys.detail(categoryId),
    queryFn: () => categoriesApi.getStoreCategoryById(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get subcategories of a category
 */
export function useSubcategories(categoryId: string) {
  return useQuery({
    queryKey: storeCategoriesKeys.subcategories(categoryId),
    queryFn: () => categoriesApi.getSubcategories(categoryId),
    enabled: !!categoryId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Get category statistics
 */
export function useCategoryStatistics(categoryId: string) {
  return useQuery({
    queryKey: storeCategoriesKeys.statistics(categoryId),
    queryFn: () => categoriesApi.getCategoryStatistics(categoryId),
    enabled: !!categoryId,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new store category
 */
export function useCreateStoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStoreCategoryData) => categoriesApi.createStoreCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeCategoriesKeys.all });
      toast.success('تم إنشاء التصنيف بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إنشاء التصنيف');
    },
  });
}

/**
 * Update store category
 */
export function useUpdateStoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateStoreCategoryData }) =>
      categoriesApi.updateStoreCategory(categoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeCategoriesKeys.all });
      toast.success('تم تحديث التصنيف بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تحديث التصنيف');
    },
  });
}

/**
 * Delete store category
 */
export function useDeleteStoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesApi.deleteStoreCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeCategoriesKeys.all });
      toast.success('تم حذف التصنيف بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف التصنيف');
    },
  });
}

/**
 * Restore deleted store category
 */
export function useRestoreStoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesApi.restoreStoreCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeCategoriesKeys.all });
      toast.success('تم استعادة التصنيف بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل استعادة التصنيف');
    },
  });
}

/**
 * Permanently delete store category
 */
export function usePermanentlyDeleteStoreCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: string) => categoriesApi.permanentlyDeleteStoreCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeCategoriesKeys.all });
      toast.success('تم حذف التصنيف نهائياً');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف التصنيف نهائياً');
    },
  });
}

