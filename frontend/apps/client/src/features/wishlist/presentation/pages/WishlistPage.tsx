'use client';

import { Heart } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { WishlistItem, EmptyWishlist } from '@/features/wishlist/components';
import { useWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks/useWishlist';
import { useAddToCart } from '@/features/cart/hooks/useCart';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export function WishlistPage() {
  const { data, isLoading, error } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();

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
        <ErrorMessage message="حدث خطأ أثناء تحميل المفضلة" variant="card" />
      </div>
    );
  }

  const products = data?.products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Heart className="w-8 h-8" />
          المفضلة
        </h1>
        <p className="text-white/60">
          {data?.total || 0} {data?.total === 1 ? 'منتج' : 'منتجات'}
        </p>
      </div>

      {/* Wishlist Items */}
      {products.length === 0 ? (
        <EmptyWishlist />
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {products.map((product) => (
              <WishlistItem
                key={product._id}
                product={product}
                onRemove={() => removeFromWishlist.mutate(product._id)}
                onAddToCart={() =>
                  addToCart.mutate({
                    productId: product._id,
                    quantity: 1,
                  })
                }
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

