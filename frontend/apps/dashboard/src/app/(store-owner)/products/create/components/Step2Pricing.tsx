/**
 * Step 2: Pricing & Inventory
 * Product pricing, SKU, and barcode information
 */

'use client';

import { motion } from 'framer-motion';
import { DollarSign, Package, Barcode } from 'lucide-react';
import type { ProductFormData } from '@/features/products/types';

interface Step2PricingProps {
  formData: ProductFormData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  errors: Record<string, string>;
}

export function Step2Pricing({ formData, handleInputChange, errors = {} }: Step2PricingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 mb-6"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        التسعير والمخزون
      </h2>

      <div className="space-y-6">
        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              السعر <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className={`w-full pr-10 pl-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border ${
                  errors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'
                } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2`}
              />
            </div>
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
          </div>

          {/* Compare At Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              السعر قبل الخصم
            </label>
            <div className="relative">
              <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                name="compareAtPrice"
                value={formData.compareAtPrice}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              اختياري - لعرض الخصم
            </p>
          </div>
        </div>

        {/* Inventory Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              رمز المنتج (SKU)
            </label>
            <div className="relative">
              <Package className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="مثال: PHONE-001"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              اختياري - لتتبع المخزون
            </p>
          </div>

          {/* Barcode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              الباركود
            </label>
            <div className="relative">
              <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                placeholder="مثال: 123456789012"
                className="w-full pr-10 pl-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              اختياري - رمز الباركود
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

