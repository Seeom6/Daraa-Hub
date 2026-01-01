/**
 * useOrders Hook
 * React Query hook for orders management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ordersService } from '../services';
import { useOrdersStore } from '../stores';
import type { OrderFilters, UpdateOrderStatusDto } from '../types';

export function useOrders(filters?: OrderFilters) {
  const queryClient = useQueryClient();
  const { setOrders, updateOrder: updateOrderStore } = useOrdersStore();

  // Get orders
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      const result = await ordersService.getOrders(filters);
      setOrders(result.data);
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Update status
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      ordersService.updateStatus(id, status),
    onSuccess: (updatedOrder) => {
      updateOrderStore(updatedOrder._id, updatedOrder);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', updatedOrder._id] });
      toast.success('تم تحديث حالة الطلب بنجاح');
    },
    onError: () => {
      toast.error('فشل تحديث حالة الطلب');
    },
  });

  // TODO: Add these methods to ordersService when backend endpoints are ready
  // Accept order
  // const acceptMutation = useMutation({
  //   mutationFn: (id: string) => ordersService.acceptOrder(id),
  //   onSuccess: (updatedOrder) => {
  //     updateOrderStore(updatedOrder._id, updatedOrder);
  //     queryClient.invalidateQueries({ queryKey: ['orders'] });
  //     toast.success('تم قبول الطلب بنجاح');
  //   },
  //   onError: () => {
  //     toast.error('فشل قبول الطلب');
  //   },
  // });

  // Cancel order
  // const cancelMutation = useMutation({
  //   mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
  //     ordersService.cancelOrder(id, reason),
  //   onSuccess: (updatedOrder) => {
  //     updateOrderStore(updatedOrder._id, updatedOrder);
  //     queryClient.invalidateQueries({ queryKey: ['orders'] });
  //     toast.success('تم إلغاء الطلب بنجاح');
  //   },
  //   onError: () => {
  //     toast.error('فشل إلغاء الطلب');
  //   },
  // });

  // Mark as shipped
  // const shipMutation = useMutation({
  //   mutationFn: ({ id, trackingNumber }: { id: string; trackingNumber?: string }) =>
  //     ordersService.markAsShipped(id, trackingNumber),
  //   onSuccess: (updatedOrder) => {
  //     updateOrderStore(updatedOrder._id, updatedOrder);
  //     queryClient.invalidateQueries({ queryKey: ['orders'] });
  //     toast.success('تم تحديث حالة الطلب إلى "قيد الشحن"');
  //   },
  //   onError: () => {
  //     toast.error('فشل تحديث حالة الطلب');
  //   },
  // });

  // Mark as delivered
  // const deliverMutation = useMutation({
  //   mutationFn: (id: string) => ordersService.markAsDelivered(id),
  //   onSuccess: (updatedOrder) => {
  //     updateOrderStore(updatedOrder._id, updatedOrder);
  //     queryClient.invalidateQueries({ queryKey: ['orders'] });
  //     toast.success('تم تحديث حالة الطلب إلى "تم التوصيل"');
  //   },
  //   onError: () => {
  //     toast.error('فشل تحديث حالة الطلب');
  //   },
  // });

  return {
    orders: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    // TODO: Uncomment when backend endpoints are ready
    // acceptOrder: acceptMutation.mutate,
    // cancelOrder: cancelMutation.mutate,
    // markAsShipped: shipMutation.mutate,
    // markAsDelivered: deliverMutation.mutate,
  };
}

// Get single order
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersService.getOrder(id),
    enabled: !!id,
  });
}

// TODO: Add these methods to ordersService when backend endpoints are ready
// Get pending orders count
// export function usePendingOrdersCount() {
//   const { setPendingCount } = useOrdersStore();

//   return useQuery({
//     queryKey: ['orders', 'pending-count'],
//     queryFn: async () => {
//       const count = await ordersService.getPendingCount();
//       setPendingCount(count);
//       return count;
//     },
//     staleTime: 30 * 1000, // 30 seconds
//     refetchInterval: 60 * 1000, // Refetch every minute
//   });
// }

// Get recent orders
// export function useRecentOrders(limit: number = 5) {
//   return useQuery({
//     queryKey: ['orders', 'recent', limit],
//     queryFn: () => ordersService.getRecentOrders(limit),
//     staleTime: 1 * 60 * 1000, // 1 minute
//   });
// }

