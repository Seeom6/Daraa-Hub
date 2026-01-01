/**
 * Products List Page
 * Main page for managing store products
 */

'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Package, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ProductStats,
  ProductFilters,
  ProductTable,
  ProductCards,
} from '@/features/products/components';
import { useProducts } from '@/features/store/hooks';
import { useAuthStore } from '@/features/store/stores';
import { filterProducts, calculateProductStats } from '@/features/products/utils';
import type { ProductFilters as ProductFiltersType } from '@/features/products/types';
import { storeOwnerService } from '@/features/store/services';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  // Get storeId from auth store
  const { storeId, setStoreId } = useAuthStore();
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(storeId);

  const [filters, setFilters] = useState<ProductFiltersType>({
    searchQuery: '',
    status: 'all',
    category: 'all',
  });

  // Fetch store profile to get the correct storeId
  useEffect(() => {
    const fetchStoreProfile = async () => {
      try {
        const profile = await storeOwnerService.getProfile();
        if (profile._id) {
          setCurrentStoreId(profile._id);
          setStoreId(profile._id); // Update Zustand store
        }
      } catch (error: any) {
        console.error('Error fetching store profile:', error);
        if (error.response?.status === 404) {
          toast.error('لم يتم العثور على ملف المتجر');
        }
      }
    };

    if (!storeId) {
      fetchStoreProfile();
    } else {
      setCurrentStoreId(storeId);
    }
  }, [storeId, setStoreId]);

  // Fetch products from backend - only when we have a storeId
  const { products, isLoading, error, meta, refetch } = useProducts({
    storeId: currentStoreId || undefined,
    page: 1,
    limit: 100,
  }, {
    enabled: !!currentStoreId, // Only fetch when we have a storeId
  });

  // Filter products based on current filters
  const filteredProducts = useMemo(
    () => filterProducts(products as any, filters.searchQuery, filters.status, filters.category),
    [products, filters]
  );

  // Calculate statistics
  const stats = useMemo(() => calculateProductStats(products as any), [products]);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<ProductFiltersType>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل المنتجات...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Package className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            حدث خطأ في تحميل المنتجات
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            يرجى المحاولة مرة أخرى
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إدارة المنتجات
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة وتحرير منتجات متجرك ({meta?.total || 0} منتج)
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all font-medium"
            title="تحديث القائمة"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <Link
            href="/products/create"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            إضافة منتج جديد
          </Link>
        </div>
      </div>

      {/* Stats */}
      <ProductStats stats={stats} />

      {/* Filters */}
      <ProductFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Products List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 overflow-hidden"
      >
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              لا توجد منتجات
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              لم يتم العثور على منتجات تطابق معايير البحث
            </p>
            <Link
              href="/products/create"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium hover:shadow-lg transition-shadow"
            >
              <Plus className="w-5 h-5" />
              إضافة منتج جديد
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <ProductTable products={filteredProducts} />

            {/* Mobile Cards */}
            <ProductCards products={filteredProducts} />
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            عرض {filteredProducts.length} من أصل {meta?.total || products.length} منتج
          </p>
          {/* Add pagination controls here if needed */}
        </div>
      )}
    </>
  );
}

