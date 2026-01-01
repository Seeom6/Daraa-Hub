'use client';

import { useState } from 'react';
import { StoreHeader, StoreStats } from '@/features/stores/components';
import { useStore, useStoreProducts, useFollowStore, useUnfollowStore } from '@/features/stores/hooks/useStores';
import { ProductCard } from '@/components/ui/ProductCard';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { AnimatePresence } from 'motion/react';
import { Package } from 'lucide-react';

export interface StorePageProps {
  slug: string;
}

export function StorePage({ slug }: StorePageProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: store, isLoading: storeLoading, error: storeError } = useStore(slug);
  const { data: productsData, isLoading: productsLoading } = useStoreProducts(slug);
  const followStore = useFollowStore();
  const unfollowStore = useUnfollowStore();

  if (storeLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="حدث خطأ أثناء تحميل المتجر" variant="card" />
      </div>
    );
  }

  const handleFollow = () => {
    followStore.mutate(store._id);
    setIsFollowing(true);
  };

  const handleUnfollow = () => {
    unfollowStore.mutate(store._id);
    setIsFollowing(false);
  };

  const products = productsData?.products || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Store Header */}
      <div className="mb-8">
        <StoreHeader
          store={store}
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />
      </div>

      {/* Store Stats */}
      <div className="mb-8">
        <StoreStats
          productsCount={store.productsCount}
          rating={store.rating}
          reviewsCount={store.reviewsCount}
          followersCount={store.followersCount}
          salesCount={store.salesCount}
        />
      </div>

      {/* Store Products */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Package className="w-6 h-6" />
          منتجات المتجر ({store.productsCount})
        </h2>

        {productsLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
            <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">لا توجد منتجات</h3>
            <p className="text-white/60">لم يتم إضافة أي منتجات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

