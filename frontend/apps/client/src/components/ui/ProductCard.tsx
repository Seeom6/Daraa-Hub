'use client';

/**
 * Product Card Component
 * Displays product information in a card format
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { Product } from '@/features/shared/types';

export interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'horizontal';
  showAddToCart?: boolean;
  showWishlist?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isInWishlist?: boolean;
}

export function ProductCard({
  product,
  variant = 'default',
  showAddToCart = true,
  showWishlist = true,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(product);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist?.(product);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <motion.div
        whileHover={{ y: -4 }}
        className={cn(
          'group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden',
          'border border-gray-200 dark:border-slate-700',
          'hover:shadow-lg transition-all duration-300',
          variant === 'horizontal' && 'flex gap-4'
        )}
      >
        {/* Image Container */}
        <div className={cn(
          'relative overflow-hidden bg-gray-100 dark:bg-slate-700',
          variant === 'horizontal' ? 'w-32 h-32 flex-shrink-0' : 'aspect-square'
        )}>
          <Image
            src={imageError ? '/images/placeholder-product.png' : (product.mainImage || product.images[0] || '/images/placeholder-product.png')}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            onError={() => setImageError(true)}
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              -{discountPercentage}%
            </div>
          )}

          {/* Wishlist Button */}
          {showWishlist && (
            <button
              onClick={handleToggleWishlist}
              className={cn(
                'absolute top-2 right-2 p-2 rounded-full',
                'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm',
                'hover:bg-white dark:hover:bg-slate-800',
                'transition-all duration-200',
                'opacity-0 group-hover:opacity-100'
              )}
              aria-label={isInWishlist ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
            >
              <Heart
                className={cn(
                  'w-5 h-5',
                  isInWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'
                )}
              />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1">
          {/* Product Name */}
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">
                ({product.reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {product.price.toLocaleString('ar-SY')} ل.س
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {product.compareAtPrice!.toLocaleString('ar-SY')} ل.س
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {showAddToCart && (
            <button
              onClick={handleAddToCart}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'bg-primary-600 hover:bg-primary-700 text-white',
                'py-2 px-4 rounded-lg',
                'transition-colors duration-200',
                'opacity-0 group-hover:opacity-100'
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">أضف للسلة</span>
            </button>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

