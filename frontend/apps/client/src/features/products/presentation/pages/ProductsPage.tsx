'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductFilters, type FilterState } from '@/features/products/components';
import { useProducts } from '@/features/products/hooks/useProducts';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import type { Product } from '@/features/shared/types';
import { toast } from 'react-hot-toast';

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'soldCount';

export function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filters from URL
  const [filters, setFilters] = useState<FilterState>({
    categories: searchParams.get('categories')?.split(',').filter(Boolean),
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
    stores: searchParams.get('stores')?.split(',').filter(Boolean),
    inStock: searchParams.get('inStock') === 'true',
  });

  // Sort
  const [sortBy, setSortBy] = useState<SortOption>(
    (searchParams.get('sort') as SortOption) || 'newest'
  );

  // Pagination
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const limit = 20;

  // Fetch data
  const { data: productsData, isLoading, error } = useProducts({
    ...filters,
    sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'price_asc' || sortBy === 'price_desc' ? 'price' : sortBy,
    sortOrder: sortBy === 'price_desc' ? 'desc' : 'asc',
    page,
    limit,
  });

  const { data: categoriesData } = useCategories();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.categories && filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.rating) params.set('rating', filters.rating.toString());
    if (filters.stores && filters.stores.length > 0) {
      params.set('stores', filters.stores.join(','));
    }
    if (filters.inStock) params.set('inStock', 'true');
    if (sortBy !== 'newest') params.set('sort', sortBy);
    if (page > 1) params.set('page', page.toString());

    const newUrl = params.toString() ? `/products?${params.toString()}` : '/products';
    router.replace(newUrl, { scroll: false });
  }, [filters, sortBy, page, router]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
    setPage(1);
  };

  const handleAddToCart = (product: Product) => {
    toast.success(`تمت إضافة ${product.name} إلى السلة`);
  };

  const handleToggleWishlist = (product: Product) => {
    toast.success(`تمت إضافة ${product.name} إلى المفضلة`);
  };

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">جميع المنتجات</h1>
        <p className="text-white/60">
          {total > 0 ? `${total} منتج` : 'لا توجد منتجات'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar - Desktop */}
        <div className="hidden lg:block">
          <ProductFilters
            categories={categoriesData?.categories || []}
            selected={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            {/* Mobile Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5" />
              الفلاتر
            </button>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-white/60">ترتيب:</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              >
                <option value="newest">الأحدث</option>
                <option value="price_asc">السعر: من الأقل للأعلى</option>
                <option value="price_desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="soldCount">الأكثر مبيعاً</option>
              </select>
            </div>

            {/* View Mode */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                aria-label="عرض شبكي"
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'bg-white/5 text-white/60 hover:text-white'
                }`}
                aria-label="عرض قائمة"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden">
              <ProductFilters
                categories={categoriesData?.categories || []}
                selected={filters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>
          )}

          {/* Products Grid/List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <ErrorMessage
              message="حدث خطأ أثناء تحميل المنتجات"
              variant="card"
            />
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <ErrorMessage
                message="لا توجد منتجات تطابق معايير البحث"
                variant="card"
              />
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard
                      product={product}
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    السابق
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            page === pageNum
                              ? 'bg-primary text-white'
                              : 'bg-white/5 text-white hover:bg-white/10'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    التالي
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

