'use client';

/**
 * Stores Filters Component
 * Filter controls for stores list
 */

import { Search, Filter, Download } from 'lucide-react';
import { Input, Select, Button, Card } from '@/components/ui';
import type { GetStoresParams } from '../../types/stores.types';

interface StoresFiltersProps {
  filters: GetStoresParams;
  onFiltersChange: (filters: GetStoresParams) => void;
  onExport?: () => void;
  isExporting?: boolean;
  categories?: Array<{ _id: string; nameAr: string }>;
}

export function StoresFilters({
  filters,
  onFiltersChange,
  onExport,
  isExporting,
  categories,
}: StoresFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value as any, page: 1 });
  };

  const handleVerificationStatusChange = (value: string) => {
    onFiltersChange({ ...filters, verificationStatus: value as any, page: 1 });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, category: value, page: 1 });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sortBy: value as any, page: 1 });
  };

  return (
    <Card>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث عن متجر..."
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
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="suspended">معلق</option>
            </select>
          </div>

          {/* Verification Status Filter */}
          <div>
            <select
              value={filters.verificationStatus || 'all'}
              onChange={(e) => handleVerificationStatusChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="all">جميع حالات التوثيق</option>
              <option value="pending">قيد الانتظار</option>
              <option value="approved">موافق عليه</option>
              <option value="rejected">مرفوض</option>
              <option value="info_required">معلومات مطلوبة</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category || 'all'}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="all">جميع التصنيفات</option>
              {categories?.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={filters.sortBy || 'createdAt'}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="createdAt">تاريخ الإنشاء</option>
              <option value="rating">التقييم</option>
              <option value="revenue">الإيرادات</option>
              <option value="totalOrders">عدد الطلبات</option>
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

