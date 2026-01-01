/**
 * Orders Hooks
 * React Query hooks for orders operations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, type OrdersQueryParams } from '../services';
import { toast } from 'react-hot-toast';

export const ORDERS_QUERY_KEY = ['orders'] as const;

/**
 * Hook to get customer orders
 * Uses TanStack Query for caching and pagination
 */
export function useOrders(params?: OrdersQueryParams) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, params],
    queryFn: () => ordersService.getMyOrders(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to get order by ID
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, orderId],
    queryFn: () => ordersService.getOrderById(orderId),
    enabled: !!orderId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
}

/**
 * Hook to cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      ordersService.cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success('تم إلغاء الطلب بنجاح');
    },
    onError: () => {
      toast.error('فشل إلغاء الطلب');
    },
  });
}

/**
 * Hook to request return
 */
export function useRequestReturn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason: string }) =>
      ordersService.requestReturn(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success('تم إرسال طلب الإرجاع بنجاح');
    },
    onError: () => {
      toast.error('فشل إرسال طلب الإرجاع');
    },
  });
}

