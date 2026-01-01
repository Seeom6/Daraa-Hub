'use client';

/**
 * Categories Slider Component
 * Horizontal scrollable categories list
 */

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import type { Category } from '@/features/shared/types';

export interface CategoriesSliderProps {
  categories: Category[];
  showAll?: boolean;
}

export function CategoriesSlider({
  categories,
  showAll = true,
}: CategoriesSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === 'right' ? scrollAmount : -scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll('left')}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10',
          'bg-white dark:bg-slate-800 shadow-lg',
          'p-2 rounded-full',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200',
          'hover:bg-gray-50 dark:hover:bg-slate-700'
        )}
        aria-label="السابق"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      <button
        onClick={() => scroll('right')}
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10',
          'bg-white dark:bg-slate-800 shadow-lg',
          'p-2 rounded-full',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity duration-200',
          'hover:bg-gray-50 dark:hover:bg-slate-700'
        )}
        aria-label="التالي"
      >
        <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category, index) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <CategoryItem category={category} />
          </motion.div>
        ))}

        {/* View All Button */}
        {showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: categories.length * 0.05 }}
          >
            <Link
              href="/categories"
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-[120px] h-[120px]',
                'bg-gradient-to-br from-primary-500 to-primary-600',
                'hover:from-primary-600 hover:to-primary-700',
                'rounded-xl shadow-md',
                'transition-all duration-200',
                'hover:shadow-lg hover:scale-105'
              )}
            >
              <span className="text-white font-semibold text-center px-4">
                عرض الكل
              </span>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface CategoryItemProps {
  category: Category;
}

function CategoryItem({ category }: CategoryItemProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className={cn(
        'flex flex-col items-center justify-center gap-2',
        'min-w-[120px] h-[120px]',
        'bg-white dark:bg-slate-800',
        'border border-gray-200 dark:border-slate-700',
        'rounded-xl shadow-sm',
        'hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500',
        'transition-all duration-200',
        'hover:scale-105'
      )}
    >
      {/* Icon */}
      {category.icon && (
        <span className="text-4xl">{category.icon}</span>
      )}

      {/* Name */}
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200 text-center px-2">
        {category.name}
      </span>

      {/* Product Count */}
      {category.productCount > 0 && (
        <span className="text-xs text-gray-400">
          {category.productCount} منتج
        </span>
      )}
    </Link>
  );
}

