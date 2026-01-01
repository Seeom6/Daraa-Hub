'use client';

/**
 * Stores Management Page
 * Main page for managing stores
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { LoadingState, ErrorState } from '@/components/common';
import {
  StoresStatsCards,
  StoresTable,
  StoresFilters,
} from '@/features/admin/components/stores';
import {
  useStores,
  useStoreStatistics,
  useSuspendStore,
  useUnsuspendStore,
  useDeleteStore,
  useExportStores,
} from '@/features/admin/hooks/useStores';
import { useStoreCategories } from '@/features/admin/hooks/useStoreCategories';
import type { GetStoresParams } from '@/features/admin/types/stores.types';

export default function StoresPage() {
  const [filters, setFilters] = useState<GetStoresParams>({
    page: 1,
    limit: 10,
    status: 'all',
    verificationStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Queries
  const { data: storesData, isLoading, error, refetch } = useStores(filters);
  const { data: statisticsData, isLoading: isLoadingStats } = useStoreStatistics();
  const { data: categoriesData } = useStoreCategories();

  // Mutations
  const suspendStore = useSuspendStore();
  const unsuspendStore = useUnsuspendStore();
  const deleteStore = useDeleteStore();
  const exportStores = useExportStores();

  const handleSuspend = (storeId: string) => {
    if (confirm('هل أنت متأكد من تعليق هذا المتجر؟')) {
      suspendStore.mutate({
        storeId,
        data: { reason: 'تعليق من لوحة التحكم' },
      });
    }
  };

  const handleUnsuspend = (storeId: string) => {
    if (confirm('هل أنت متأكد من إلغاء تعليق هذا المتجر؟')) {
      unsuspendStore.mutate({
        storeId,
        data: { reason: 'إلغاء التعليق من لوحة التحكم' },
      });
    }
  };

  const handleDelete = (storeId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المتجر؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      deleteStore.mutate(storeId);
    }
  };

  const handleExport = () => {
    exportStores.mutate(filters);
  };

  if (error) {
    return <ErrorState message="فشل تحميل المتاجر" onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">إدارة المتاجر</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  عرض وإدارة جميع المتاجر المسجلة في المنصة
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <StoresStatsCards
            statistics={statisticsData?.data}
            isLoading={isLoadingStats}
          />
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <StoresFilters
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
            isExporting={exportStores.isPending}
            categories={categoriesData?.data}
          />
        </motion.div>

        {/* Stores Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StoresTable
            stores={storesData?.data || []}
            isLoading={isLoading}
            onSuspend={handleSuspend}
            onUnsuspend={handleUnsuspend}
            onDelete={handleDelete}
          />
        </motion.div>

        {/* Pagination */}
        {storesData && storesData.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex justify-center gap-2"
          >
            <Button
              variant="secondary"
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
              disabled={filters.page === 1}
            >
              السابق
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-gray-600 dark:text-gray-400">
                صفحة {filters.page} من {storesData.totalPages}
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={filters.page === storesData.totalPages}
            >
              التالي
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

