'use client';

/**
 * Verification Requests Page
 * Main page for managing verification requests
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck } from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/common';
import {
  VerificationStatsCards,
  VerificationRequestsTable,
  VerificationFilters,
} from '@/features/admin/components/stores';
import {
  useVerificationRequests,
  useVerificationStatistics,
  useExportVerification,
} from '@/features/admin/hooks/useVerification';
import type { GetVerificationRequestsParams } from '@/features/admin/types/stores.types';
import { Button } from '@/components/ui';

export default function VerificationRequestsPage() {
  const [filters, setFilters] = useState<GetVerificationRequestsParams>({
    page: 1,
    limit: 10,
    status: 'all',
    applicantType: 'all',
  });

  // Queries
  const { data: requestsData, isLoading, error, refetch } = useVerificationRequests(filters);
  const { data: statisticsData, isLoading: isLoadingStats } = useVerificationStatistics();

  // Mutations
  const exportVerification = useExportVerification();

  const handleExport = () => {
    exportVerification.mutate(filters);
  };

  if (error) {
    return <ErrorState message="فشل تحميل طلبات التوثيق" onRetry={refetch} />;
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
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                <FileCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  طلبات التوثيق
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  مراجعة والموافقة على طلبات التوثيق المقدمة
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
          <VerificationStatsCards
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
          <VerificationFilters
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExport}
            isExporting={exportVerification.isPending}
          />
        </motion.div>

        {/* Verification Requests Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <VerificationRequestsTable
            requests={requestsData?.data?.requests || []}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Pagination */}
        {requestsData?.data && requestsData.data.totalPages > 1 && (
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
                صفحة {filters.page} من {requestsData.data.totalPages}
              </span>
            </div>
            <Button
              variant="secondary"
              onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
              disabled={filters.page === requestsData.data.totalPages}
            >
              التالي
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

