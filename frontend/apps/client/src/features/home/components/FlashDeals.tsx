'use client';

/**
 * Flash Deals Component
 * Displays flash deals with countdown timer
 */

import { Zap } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Spinner } from '@/components/ui';
import type { FlashDeal, Product } from '@/features/shared/types';

export interface FlashDealsProps {
  deal?: FlashDeal;
  isLoading?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  onDealEnd?: () => void;
}

export function FlashDeals({
  deal,
  isLoading = false,
  onAddToCart,
  onToggleWishlist,
  onDealEnd,
}: FlashDealsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!deal || !deal.products || deal.products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-full">
              <Zap className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {deal.title || 'عروض سريعة'}
              </h2>
              {deal.description && (
                <p className="text-white/90 text-sm mt-1">
                  {deal.description}
                </p>
              )}
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-white/90 text-sm mb-2 text-center">
              ينتهي العرض خلال
            </p>
            <CountdownTimer
              endTime={deal.endDate}
              onEnd={onDealEnd}
              showLabels={true}
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {deal.products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
    </section>
  );
}

