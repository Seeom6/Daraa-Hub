'use client';

/**
 * Category Card Component
 * Displays category information in a card format
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { Category } from '@/features/shared/types';

export interface CategoryCardProps {
  category: Category;
  variant?: 'default' | 'compact' | 'icon-only';
  showProductCount?: boolean;
}

export function CategoryCard({
  category,
  variant = 'default',
  showProductCount = true,
}: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link href={`/categories/${category.slug}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        className={cn(
          'group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden',
          'border border-gray-200 dark:border-slate-700',
          'hover:shadow-lg hover:border-primary-500 dark:hover:border-primary-500',
          'transition-all duration-300',
          variant === 'icon-only' && 'aspect-square'
        )}
      >
        {/* Image/Icon Container */}
        <div className={cn(
          'relative overflow-hidden bg-gradient-to-br from-primary-50 to-primary-100',
          'dark:from-slate-700 dark:to-slate-600',
          variant === 'icon-only' ? 'h-full' : 'aspect-video'
        )}>
          {category.image && !imageError ? (
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : category.icon ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl">{category.icon}</span>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-300">
                  {category.name.charAt(0)}
                </span>
              </div>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Content */}
        {variant !== 'icon-only' && (
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white text-center mb-1">
              {category.name}
            </h3>

            {showProductCount && category.productCount > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {category.productCount} منتج
              </p>
            )}

            {category.description && variant === 'default' && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
        )}

        {/* Icon-only variant: Name overlay */}
        {variant === 'icon-only' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <h3 className="font-semibold text-white text-center text-sm">
              {category.name}
            </h3>
          </div>
        )}
      </motion.div>
    </Link>
  );
}

