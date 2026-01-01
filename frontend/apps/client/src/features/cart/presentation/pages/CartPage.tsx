'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { CartItem, CartSummary, CouponInput, EmptyCart } from '@/features/cart/components';
import {
  useCart,
  useUpdateCartItem,
  useRemoveFromCart,
  useApplyCoupon,
  useRemoveCoupon,
} from '@/features/cart/hooks/useCart';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading, error } = useCart();
  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const applyCoupon = useApplyCoupon();
  const removeCoupon = useRemoveCoupon();

  const handleQuantityChange = (productId: string, quantity: number) => {
    updateCartItem.mutate({ productId, quantity });
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart.mutate(productId);
  };

  const handleApplyCoupon = (code: string) => {
    applyCoupon.mutate({ code });
  };

  const handleRemoveCoupon = () => {
    removeCoupon.mutate();
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="حدث خطأ أثناء تحميل السلة" variant="card" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          سلة التسوق
        </h1>
        <p className="text-white/60">
          لديك {cart.itemsCount} {cart.itemsCount === 1 ? 'منتج' : 'منتجات'} في السلة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Coupon Input */}
          <CouponInput
            coupon={cart.coupon}
            onApply={handleApplyCoupon}
            onRemove={handleRemoveCoupon}
            isLoading={applyCoupon.isPending || removeCoupon.isPending}
          />

          {/* Items List */}
          <AnimatePresence mode="popLayout">
            {cart.items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onQuantityChange={(quantity) => handleQuantityChange(item.productId, quantity)}
                onRemove={() => handleRemoveItem(item.productId)}
                isUpdating={updateCartItem.isPending || removeFromCart.isPending}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Cart Summary */}
        <div>
          <CartSummary
            subtotal={cart.subtotal}
            discount={cart.discount}
            shipping={cart.shipping}
            total={cart.total}
            coupon={cart.coupon}
            onCheckout={handleCheckout}
            isCheckoutDisabled={cart.items.length === 0}
          />
        </div>
      </div>
    </div>
  );
}

