/**
 * Product Filters Component
 * Search and filter controls for products
 */

'use client';

import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ProductFilters as ProductFiltersType } from '../types';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFilterChange: (filters: Partial<ProductFiltersType>) => void;
}

export function ProductFilters({ filters, onFilterChange }: ProductFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 mb-6"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن منتج..."
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full pr-10 pl-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="draft">مسودة</option>
          <option value="low_stock">مخزون منخفض</option>
          <option value="out_of_stock">نفذ من المخزون</option>
        </select>

        {/* Category Filter */}
        <select
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">جميع الفئات</option>
          <option value="1">إلكترونيات</option>
          <option value="2">أزياء</option>
          <option value="3">أغذية</option>
        </select>
      </div>
    </motion.div>
  );
}

