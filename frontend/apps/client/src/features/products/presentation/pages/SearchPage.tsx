'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'motion/react';
import { SearchBar } from '@/features/products/components';
import { ProductCard } from '@/components/ui/ProductCard';
import { useSearchProducts } from '@/features/products/hooks/useProducts';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Product } from '@/features/shared/types';
import { toast } from 'react-hot-toast';

export function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, error } = useSearchProducts(debouncedQuery, {
    limit: 20,
  });

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
  };

  const handleAddToCart = (product: Product) => {
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  const handleToggleWishlist = (product: Product) => {
    toast.success(`تمت إضافة ${product.name} إلى المفضلة`);
  };

  const products = data?.products || [];
  const total = data?.total || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-6">البحث عن منتجات</h1>
        <SearchBar
          placeholder="ابحث عن منتجات..."
          onSearch={handleSearch}
          autoFocus
        />
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Results Count */}
        {debouncedQuery && (
          <div className="flex items-center justify-between">
            <p className="text-white/60">
              {isLoading ? (
                'جاري البحث...'
              ) : total > 0 ? (
                <>
                  نتائج البحث عن <span className="text-white font-medium">&quot;{debouncedQuery}&quot;</span>
                  {' '}({total} منتج)
                </>
              ) : (
                <>
                  لا توجد نتائج لـ <span className="text-white font-medium">&quot;{debouncedQuery}&quot;</span>
                </>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorMessage
            message="حدث خطأ أثناء البحث"
            variant="card"
          />
        ) : !debouncedQuery ? (
          <div className="text-center py-12">
            <p className="text-white/40">ابدأ بكتابة كلمة البحث</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ErrorMessage
              message="لا توجد منتجات تطابق بحثك"
              variant="card"
            />
            <p className="text-white/60 mt-4">جرب كلمات بحث مختلفة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

