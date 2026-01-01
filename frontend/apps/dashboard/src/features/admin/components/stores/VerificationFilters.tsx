'use client';

/**
 * Verification Filters Component
 * Filter controls for verification requests list
 */

import { Search, Download } from 'lucide-react';
import { Input, Select, Button, Card } from '@/components/ui';
import type { GetVerificationRequestsParams } from '../../types/stores.types';

interface VerificationFiltersProps {
  filters: GetVerificationRequestsParams;
  onFiltersChange: (filters: GetVerificationRequestsParams) => void;
  onExport?: () => void;
  isExporting?: boolean;
}

export function VerificationFilters({
  filters,
  onFiltersChange,
  onExport,
  isExporting,
}: VerificationFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as any, page: 1 });
  };

  const handleApplicantTypeChange = (value: string) => {
    onFiltersChange({ ...filters, applicantType: value as any, page: 1 });
  };

  return (
    <Card>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث عن طلب توثيق..."
                value={filters.search || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="under_review">قيد المراجعة</option>
              <option value="approved">موافق عليه</option>
              <option value="rejected">مرفوض</option>
              <option value="info_required">معلومات مطلوبة</option>
            </select>
          </div>

          {/* Applicant Type Filter */}
          <div>
            <select
              value={filters.applicantType || 'all'}
              onChange={(e) => handleApplicantTypeChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="all">جميع الأنواع</option>
              <option value="store_owner">صاحب متجر</option>
              <option value="courier">سائق توصيل</option>
            </select>
          </div>
        </div>

        {/* Export Button */}
        {onExport && (
          <div className="mt-4 flex justify-end">
            <Button
              variant="secondary"
              onClick={onExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                  جاري التصدير...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  تصدير البيانات
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

