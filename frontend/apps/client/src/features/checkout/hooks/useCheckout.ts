import { useMutation, useQuery } from '@tanstack/react-query';
import { checkoutService } from '../services/checkout.service';
import type { CreateOrderInput } from '@/features/shared/types/order.types';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

/**
 * Hook to get shipping methods
 */
export function useShippingMethods(addressId?: string) {
  return useQuery({
    queryKey: ['shipping-methods', addressId],
    queryFn: () => checkoutService.getShippingMethods(addressId!),
    enabled: !!addressId,
  });
}

/**
 * Hook to create order
 */
export function useCreateOrder() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => checkoutService.createOrder(input),
    onSuccess: (order) => {
      toast.success('تم إنشاء الطلب بنجاح');
      router.push(`/orders/${order._id}/success`);
    },
    onError: () => {
      toast.error('فشل إنشاء الطلب');
    },
  });
}

/**
 * Hook to get order
 */
export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => checkoutService.getOrder(orderId),
    enabled: !!orderId,
  });
}

