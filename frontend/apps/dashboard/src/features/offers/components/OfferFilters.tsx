/**
 * Offer Filters Component
 * Filters for offers list
 */

'use client';

import { Input, Select } from '@/components/ui';
import { Search } from 'lucide-react';
import type { OfferFilters as OfferFiltersType, DiscountType } from '../types';

export interface OfferFiltersProps {
  filters: OfferFiltersType;
  onFiltersChange: (filters: OfferFiltersType) => void;
}

export function OfferFilters({ filters, onFiltersChange }: OfferFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleDiscountTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      discountType: value === 'all' ? undefined : (value as DiscountType),
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      currentOnly: value === 'active',
      page: 1,
    });
  };

  const discountTypeOptions = [
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'percentage', label: 'نسبة مئوية' },
    { value: 'fixed', label: 'مبلغ ثابت' },
  ];

  const statusOptions = [
    { value: 'all', label: 'جميع الحالات' },
    { value: 'active', label: 'النشطة فقط' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Search */}
      <div className="md:col-span-1">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="ابحث عن عرض..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Discount Type Filter */}
      <div>
        <Select
          options={discountTypeOptions}
          value={filters.discountType || 'all'}
          onChange={(e) => handleDiscountTypeChange(e.target.value)}
          fullWidth
        />
      </div>

      {/* Status Filter */}
      <div>
        <Select
          options={statusOptions}
          value={filters.currentOnly ? 'active' : 'all'}
          onChange={(e) => handleStatusChange(e.target.value)}
          fullWidth
        />
      </div>
    </div>
  );
}

