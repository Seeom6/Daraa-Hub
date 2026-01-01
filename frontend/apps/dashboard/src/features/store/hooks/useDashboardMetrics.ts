/**
 * useDashboardMetrics Hook
 * React Query hook for dashboard metrics and analytics
 */

import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services';
import type { AnalyticsQuery } from '../types';

export function useDashboardMetrics(storeId: string) {
  return useQuery({
    queryKey: ['dashboard-metrics', storeId],
    queryFn: () => analyticsService.getStoreAnalytics(storeId),
    enabled: !!storeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useStoreAnalytics(storeId: string) {
  return useQuery({
    queryKey: ['store-analytics', storeId],
    queryFn: () => analyticsService.getStoreAnalytics(storeId),
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSalesReport(startDate: string, endDate: string) {
  return useQuery({
    queryKey: ['sales-report', startDate, endDate],
    queryFn: () => analyticsService.getSalesReport(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useTopProducts(limit: number = 10) {
  return useQuery({
    queryKey: ['top-products', limit],
    queryFn: () => analyticsService.getTopProducts(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly' | 'yearly') {
  return useQuery({
    queryKey: ['revenue', period],
    queryFn: () => analyticsService.getRevenueByPeriod(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

