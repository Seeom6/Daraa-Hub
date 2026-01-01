'use client';

/**
 * Category Page Component
 * Displays a specific category with its products
 */

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProductCard } from '@/components/ui/ProductCard';
import { Spinner, ErrorMessage } from '@/components/ui';
import { useCategory, useCategoryProducts } from '@/features/categories/hooks/useCategories';
import type { Product } from '@/features/shared/types';

export interface CategoryPageProps {
  slug: string;
}

export function CategoryPage({ slug }: CategoryPageProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategory(slug);
  const {
    data: productsData,
    isLoading: productsLoading,
    error: productsError,
  } = useCategoryProducts(slug, { page, limit: 24, sortBy, sortOrder });

  const handleAddToCart = (product: Product) => {
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  const handleToggleWishlist = (product: Product) => {
    toast.success(`تمت إضافة ${product.name} إلى المفضلة`);
  };

  if (categoryLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <ErrorMessage message="التصنيف غير موجود" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/" className="hover:text-primary-600 dark:hover:text-primary-400">
          الرئيسية
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/categories" className="hover:text-primary-600 dark:hover:text-primary-400">
          التصنيفات
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white font-medium">
          {category.name}
        </span>
      </nav>

      {/* Category Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
        <div className="flex items-start gap-4">
          {category.icon && (
            <span className="text-5xl">{category.icon}</span>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-gray-600 dark:text-gray-400">
                {category.description}
              </p>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              {category.productCount} منتج
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
        <button className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400">
          <SlidersHorizontal className="w-5 h-5" />
          <span>تصفية</span>
        </button>

        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newSortOrder] = e.target.value.split('-');
            setSortBy(newSortBy);
            setSortOrder(newSortOrder as 'asc' | 'desc');
          }}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        >
          <option value="createdAt-desc">الأحدث</option>
          <option value="price-asc">السعر: من الأقل للأعلى</option>
          <option value="price-desc">السعر: من الأعلى للأقل</option>
          <option value="rating-desc">الأعلى تقييماً</option>
          <option value="soldCount-desc">الأكثر مبيعاً</option>
        </select>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : productsError ? (
        <ErrorMessage message="حدث خطأ أثناء تحميل المنتجات" />
      ) : productsData?.products && productsData.products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {productsData.products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
            />
          ))}
        </div>
      ) : (
        <ErrorMessage message="لا توجد منتجات في هذا التصنيف" variant="card" />
      )}
    </div>
  );
}

