import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService, type OrdersFilters } from '../services/orders.service';
import { toast } from 'react-hot-toast';

const ORDERS_QUERY_KEY = ['orders'];

/**
 * Hook to get my orders
 */
export function useOrders(filters?: OrdersFilters) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, 'my-orders', filters],
    queryFn: () => ordersService.getMyOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to get order by ID
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: [...ORDERS_QUERY_KEY, id],
    queryFn: () => ordersService.getOrderById(id),
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to cancel order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ordersService.cancelOrder(id, reason),
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
    mutationFn: ({ id, data }: { id: string; data: { reason: string; items?: string[] } }) =>
      ordersService.requestReturn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      toast.success('تم إرسال طلب الإرجاع بنجاح');
    },
    onError: () => {
      toast.error('فشل إرسال طلب الإرجاع');
    },
  });
}

