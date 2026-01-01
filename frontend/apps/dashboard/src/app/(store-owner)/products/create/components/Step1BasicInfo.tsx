/**
 * Step 1: Basic Information
 * Product name, description, and category selection
 */

'use client';

import { motion } from 'framer-motion';
import type { ProductFormData } from '@/features/products/types';
import type { Category } from '@daraa/api';

interface Step1BasicInfoProps {
  formData: ProductFormData;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  errors: Record<string, string>;
  categories: Category[];
  loadingCategories: boolean;
}

export function Step1BasicInfo({
  formData,
  handleInputChange,
  errors = {},
  categories,
  loadingCategories
}: Step1BasicInfoProps) {
  // Map icon names to emoji
  const iconMap: Record<string, string> = {
    'Smartphone': '📱',
    'Shirt': '👔',
    'Home': '🏠',
    'Dumbbell': '⚽',
    'Book': '📚',
    'Sparkles': '✨',
    'Gamepad2': '🎮',
    'Car': '🚗',
    'Coffee': '☕',
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 mb-6"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        المعلومات الأساسية
      </h2>

      <div className="space-y-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            اسم المنتج <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="مثال: هاتف Samsung Galaxy S23"
            className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border ${
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'
            } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            وصف المنتج <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder="اكتب وصفاً تفصيلياً للمنتج..."
            className={`w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border ${
              errors.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500'
            } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 resize-none`}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            الفئة <span className="text-red-500">*</span>
          </label>
          {loadingCategories ? (
            <div className="text-center py-8 text-gray-500">
              جاري تحميل الفئات...
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              لا توجد فئات متاحة
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => {
                    const event = {
                      target: { name: 'category', value: category._id },
                    } as React.ChangeEvent<HTMLSelectElement>;
                    handleInputChange(event);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.category === category._id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{iconMap[category.icon || ''] || '📦'}</div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {category.name}
                  </p>
                </button>
              ))}
            </div>
          )}
          {errors.category && <p className="mt-2 text-sm text-red-500">{errors.category}</p>}
        </div>
      </div>
    </motion.div>
  );
}

