import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storesService } from '../services/stores.service';
import type { StoreFilters } from '@/features/shared/types/store.types';
import { toast } from 'react-hot-toast';

const STORES_QUERY_KEY = ['stores'];

/**
 * Hook to get all stores
 */
export function useStores(filters?: StoreFilters) {
  return useQuery({
    queryKey: [...STORES_QUERY_KEY, 'list', filters],
    queryFn: () => storesService.getStores(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get store by slug
 */
export function useStore(slug: string) {
  return useQuery({
    queryKey: [...STORES_QUERY_KEY, slug],
    queryFn: () => storesService.getStoreBySlug(slug),
    enabled: !!slug,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get store products
 */
export function useStoreProducts(
  slug: string,
  filters?: { page?: number; limit?: number; category?: string; sort?: string }
) {
  return useQuery({
    queryKey: [...STORES_QUERY_KEY, slug, 'products', filters],
    queryFn: () => storesService.getStoreProducts(slug, filters),
    enabled: !!slug,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get store reviews
 */
export function useStoreReviews(
  slug: string,
  filters?: { page?: number; limit?: number }
) {
  return useQuery({
    queryKey: [...STORES_QUERY_KEY, slug, 'reviews', filters],
    queryFn: () => storesService.getStoreReviews(slug, filters),
    enabled: !!slug,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to follow store
 */
export function useFollowStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storesService.followStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
      toast.success('تمت متابعة المتجر بنجاح');
    },
    onError: () => {
      toast.error('فشلت متابعة المتجر');
    },
  });
}

/**
 * Hook to unfollow store
 */
export function useUnfollowStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storesService.unfollowStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORES_QUERY_KEY });
      toast.success('تم إلغاء متابعة المتجر');
    },
    onError: () => {
      toast.error('فشل إلغاء متابعة المتجر');
    },
  });
}

/**
 * Hook to get following stores
 */
export function useFollowingStores() {
  return useQuery({
    queryKey: [...STORES_QUERY_KEY, 'following'],
    queryFn: () => storesService.getFollowingStores(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

