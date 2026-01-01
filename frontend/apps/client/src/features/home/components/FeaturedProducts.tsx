'use client';

/**
 * Featured Products Component
 * Displays featured products in a grid
 */

import { ProductCard } from '@/components/ui/ProductCard';
import { Spinner } from '@/components/ui';
import type { Product } from '@/features/shared/types';

export interface FeaturedProductsProps {
  products: Product[];
  isLoading?: boolean;
  title?: string;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
}

export function FeaturedProducts({
  products,
  isLoading = false,
  title = 'المنتجات المميزة',
  onAddToCart,
  onToggleWishlist,
}: FeaturedProductsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {products.map((product) => (
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

