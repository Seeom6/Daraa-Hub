'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import type { Category } from '@/features/shared/types';

export interface FilterState {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  stores?: string[];
  inStock?: boolean;
}

export interface ProductFiltersProps {
  categories?: Category[];
  priceRange?: { min: number; max: number };
  ratings?: number[];
  stores?: { id: string; name: string }[];
  selected: FilterState;
  onChange: (filters: FilterState) => void;
  onClear?: () => void;
}

export function ProductFilters({
  categories = [],
  priceRange = { min: 0, max: 10000 },
  ratings = [5, 4, 3, 2, 1],
  stores = [],
  selected,
  onChange,
  onClear,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'categories',
    'price',
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    const current = selected.categories || [];
    const updated = current.includes(categoryId)
      ? current.filter((id) => id !== categoryId)
      : [...current, categoryId];
    onChange({ ...selected, categories: updated });
  };

  const handleStoreToggle = (storeId: string) => {
    const current = selected.stores || [];
    const updated = current.includes(storeId)
      ? current.filter((id) => id !== storeId)
      : [...current, storeId];
    onChange({ ...selected, stores: updated });
  };

  const handleRatingChange = (rating: number) => {
    onChange({ ...selected, rating: selected.rating === rating ? undefined : rating });
  };

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    onChange({
      ...selected,
      [type === 'min' ? 'minPrice' : 'maxPrice']: value,
    });
  };

  const handleInStockToggle = () => {
    onChange({ ...selected, inStock: !selected.inStock });
  };

  const hasActiveFilters =
    (selected.categories && selected.categories.length > 0) ||
    selected.minPrice !== undefined ||
    selected.maxPrice !== undefined ||
    selected.rating !== undefined ||
    (selected.stores && selected.stores.length > 0) ||
    selected.inStock;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-white">الفلاتر</h3>
        </div>
        {hasActiveFilters && onClear && (
          <button
            onClick={onClear}
            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            مسح الكل
          </button>
        )}
      </div>

      {/* In Stock Filter */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="inStock"
          checked={selected.inStock || false}
          onChange={handleInStockToggle}
          className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
        />
        <label htmlFor="inStock" className="text-sm text-white cursor-pointer">
          المنتجات المتوفرة فقط
        </label>
      </div>

      {/* Categories Filter */}
      {categories.length > 0 && (
        <FilterSection
          title="التصنيفات"
          isExpanded={expandedSections.includes('categories')}
          onToggle={() => toggleSection('categories')}
        >
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category._id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selected.categories?.includes(category._id) || false}
                  onChange={() => handleCategoryToggle(category._id)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  {category.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range Filter */}
      <FilterSection
        title="السعر"
        isExpanded={expandedSections.includes('price')}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-white/60 mb-1 block">من</label>
              <input
                type="number"
                value={selected.minPrice || priceRange.min}
                onChange={(e) => handlePriceChange('min', Number(e.target.value))}
                min={priceRange.min}
                max={priceRange.max}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="text-xs text-white/60 mb-1 block">إلى</label>
              <input
                type="number"
                value={selected.maxPrice || priceRange.max}
                onChange={(e) => handlePriceChange('max', Number(e.target.value))}
                min={priceRange.min}
                max={priceRange.max}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </FilterSection>

      {/* Rating Filter */}
      {ratings.length > 0 && (
        <FilterSection
          title="التقييم"
          isExpanded={expandedSections.includes('rating')}
          onToggle={() => toggleSection('rating')}
        >
          <div className="space-y-2">
            {ratings.map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={selected.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="w-4 h-4 border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < rating ? 'text-yellow-400' : 'text-white/20'}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-sm text-white/60 mr-1">وأكثر</span>
                </div>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Stores Filter */}
      {stores.length > 0 && (
        <FilterSection
          title="المتاجر"
          isExpanded={expandedSections.includes('stores')}
          onToggle={() => toggleSection('stores')}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stores.map((store) => (
              <label
                key={store.id}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={selected.stores?.includes(store.id) || false}
                  onChange={() => handleStoreToggle(store.id)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  {store.name}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  );
}

// Filter Section Component
interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className="border-t border-white/10 pt-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-white hover:text-primary transition-colors mb-3"
      >
        <span className="font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

