/**
 * useStoreCategories Hook
 * Fetches and manages store categories
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getStoreCategories } from '../services/vendor.service';

export function useStoreCategories() {
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['store-categories'],
    queryFn: getStoreCategories,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    categories: categories || [],
    isLoading,
    error,
    refetch,
  };
}

