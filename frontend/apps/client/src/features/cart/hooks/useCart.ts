import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '../services/cart.service';
import { useCartStore } from '../store/cartStore';
import type { AddToCartInput, UpdateCartItemInput, ApplyCouponInput } from '../types/cart.types';
import { toast } from 'react-hot-toast';

const CART_QUERY_KEY = ['cart'];

/**
 * Hook to get cart data
 */
export function useCart() {
  const setCart = useCartStore((state) => state.setCart);

  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const cart = await cartService.getCart();
      setCart(cart);
      return cart;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
  });
}

/**
 * Hook to add item to cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();
  const { setCart, openCart } = useCartStore();

  return useMutation({
    mutationFn: (input: AddToCartInput) => cartService.addToCart(input),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(CART_QUERY_KEY, cart);
      toast.success('تمت إضافة المنتج إلى السلة');
      openCart();
    },
    onError: () => {
      toast.error('فشل إضافة المنتج إلى السلة');
    },
  });
}

/**
 * Hook to update cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.updateCartItem(productId, { productId, quantity }),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(CART_QUERY_KEY, cart);
    },
    onError: () => {
      toast.error('فشل تحديث الكمية');
    },
  });
}

/**
 * Hook to remove item from cart
 */
export function useRemoveFromCart() {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);

  return useMutation({
    mutationFn: (productId: string) => cartService.removeFromCart(productId),
    onSuccess: (cart) => {
      setCart(cart);
      queryClient.setQueryData(CART_QUERY_KEY, cart);
      toast.success('تم حذف المنتج من السلة');
    },
    onError: () => {
      toast.error('فشل حذف المنتج');
    },
  });
}

/**
 * Hook to clear cart
 */
export function useClearCart() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => {
      clearCart();
      queryClient.setQueryData(CART_QUERY_KEY, null);
      toast.success('تم مسح السلة');
    },
    onError: () => {
      toast.error('فشل مسح السلة');
    },
  });
}

/**
 * Hook to apply coupon
 */
export function useApplyCoupon() {
  const queryClient = useQueryClient();
  const { setCart, applyCoupon } = useCartStore();

  return useMutation({
    mutationFn: (input: ApplyCouponInput) => cartService.applyCoupon(input),
    onSuccess: (cart) => {
      setCart(cart);
      if (cart.coupon) {
        applyCoupon(cart.coupon);
      }
      queryClient.setQueryData(CART_QUERY_KEY, cart);
      toast.success('تم تطبيق الكوبون بنجاح');
    },
    onError: () => {
      toast.error('كوبون غير صالح');
    },
  });
}

/**
 * Hook to remove coupon
 */
export function useRemoveCoupon() {
  const queryClient = useQueryClient();
  const { setCart, removeCoupon } = useCartStore();

  return useMutation({
    mutationFn: () => cartService.removeCoupon(),
    onSuccess: (cart) => {
      setCart(cart);
      removeCoupon();
      queryClient.setQueryData(CART_QUERY_KEY, cart);
      toast.success('تم إزالة الكوبون');
    },
    onError: () => {
      toast.error('فشل إزالة الكوبون');
    },
  });
}

