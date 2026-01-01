'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Store, Star, Package, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import type { Store as StoreType } from '@/features/shared/types/store.types';

export interface StoreCardProps {
  store: StoreType;
  variant?: 'default' | 'compact';
}

export function StoreCard({ store, variant = 'default' }: StoreCardProps) {
  return (
    <Link href={`/stores/${store.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
            {store.logo ? (
              <Image
                src={store.logo}
                alt={store.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="w-8 h-8 text-white/40" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white truncate">
                {store.name}
              </h3>
              {store.isVerified && (
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">{store.rating.toFixed(1)}</span>
              </div>
              <span className="text-white/40">•</span>
              <span className="text-white/60">
                {store.reviewsCount} {store.reviewsCount === 1 ? 'تقييم' : 'تقييمات'}
              </span>
            </div>

            {/* Category */}
            {store.category && (
              <p className="text-sm text-white/60 mt-1">{store.category}</p>
            )}
          </div>
        </div>

        {/* Description */}
        {variant === 'default' && store.description && (
          <p className="text-sm text-white/60 mb-4 line-clamp-2">
            {store.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-white/80">
            <Package className="w-4 h-4 text-white/60" />
            <span>{store.productsCount} منتج</span>
          </div>

          {variant === 'default' && (
            <>
              <span className="text-white/40">•</span>
              <span className="text-white/60">
                {store.followersCount} متابع
              </span>
            </>
          )}
        </div>
      </motion.div>
    </Link>
  );
}

