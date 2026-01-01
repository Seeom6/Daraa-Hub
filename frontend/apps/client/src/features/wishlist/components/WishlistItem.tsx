'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '@/features/shared/types';

export interface WishlistItemProps {
  product: Product;
  onRemove: () => void;
  onAddToCart: () => void;
}

export function WishlistItem({ product, onRemove, onAddToCart }: WishlistItemProps) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
    >
      <div className="flex gap-4 p-4">
        {/* Product Image */}
        <Link href={`/products/${product.slug}`} className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={product.mainImage || product.images[0] || '/placeholder.png'}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
          {hasDiscount && (
            <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${product.slug}`}>
            <h3 className="text-white font-medium mb-1 line-clamp-2 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          {product.rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-white/80">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-white/60">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-primary">
              {product.price.toLocaleString('ar-SY')} ل.س
            </span>
            {hasDiscount && (
              <span className="text-sm text-white/40 line-through">
                {product.compareAtPrice!.toLocaleString('ar-SY')} ل.س
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm font-medium">أضف للسلة</span>
            </button>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onRemove();
          }}
          className="p-2 text-white/60 hover:text-red-400 transition-colors self-start"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

