/**
 * Stores Module - React Query Hooks
 * Custom hooks for stores data fetching and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { GetStoresParams } from '../types/stores.types';
import * as storesApi from '../api/stores.api';

// ============================================================================
// Query Keys
// ============================================================================

export const storesKeys = {
  all: ['stores'] as const,
  lists: () => [...storesKeys.all, 'list'] as const,
  list: (params: GetStoresParams) => [...storesKeys.lists(), params] as const,
  details: () => [...storesKeys.all, 'detail'] as const,
  detail: (id: string) => [...storesKeys.details(), id] as const,
  statistics: () => [...storesKeys.all, 'statistics'] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Get all stores with filters and pagination
 */
export function useStores(params?: GetStoresParams) {
  return useQuery({
    queryKey: storesKeys.list(params || {}),
    queryFn: () => storesApi.getStores(params),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get store by ID
 */
export function useStore(storeId: string) {
  return useQuery({
    queryKey: storesKeys.detail(storeId),
    queryFn: () => storesApi.getStoreById(storeId),
    enabled: !!storeId,
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Get store statistics
 */
export function useStoreStatistics() {
  return useQuery({
    queryKey: storesKeys.statistics(),
    queryFn: storesApi.getStoreStatistics,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Search stores
 */
export function useSearchStores(query: string) {
  return useQuery({
    queryKey: [...storesKeys.all, 'search', query],
    queryFn: () => storesApi.searchStores(query),
    enabled: query.length > 0,
    staleTime: 10000, // 10 seconds
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Suspend store
 */
export function useSuspendStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: { reason: string } }) =>
      storesApi.suspendStore(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storesKeys.all });
      toast.success('تم تعليق المتجر بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تعليق المتجر');
    },
  });
}

/**
 * Unsuspend store
 */
export function useUnsuspendStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, data }: { storeId: string; data: { reason: string } }) =>
      storesApi.unsuspendStore(storeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storesKeys.all });
      toast.success('تم إلغاء تعليق المتجر بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل إلغاء تعليق المتجر');
    },
  });
}

/**
 * Delete store
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (storeId: string) => storesApi.deleteStore(storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storesKeys.all });
      toast.success('تم حذف المتجر بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل حذف المتجر');
    },
  });
}

/**
 * Export stores data
 */
export function useExportStores() {
  return useMutation({
    mutationFn: (params?: GetStoresParams) => storesApi.exportStoresData(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stores-${new Date().toISOString()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('تم تصدير البيانات بنجاح');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'فشل تصدير البيانات');
    },
  });
}

