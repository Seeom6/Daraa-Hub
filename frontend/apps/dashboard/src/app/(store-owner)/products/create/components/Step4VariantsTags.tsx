/**
 * Step 4: Variants & Tags
 * Product variants and tags management
 */

'use client';

import { motion } from 'framer-motion';
import { Plus, X, Edit2, Check } from 'lucide-react';
import type { ProductFormData, ProductVariant } from '@/features/products/types';

interface Step4VariantsTagsProps {
  formData: ProductFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProductFormData>>;
  currentTag: string;
  setCurrentTag: React.Dispatch<React.SetStateAction<string>>;
  currentVariantName: string;
  setCurrentVariantName: React.Dispatch<React.SetStateAction<string>>;
  currentVariantOption: string;
  setCurrentVariantOption: React.Dispatch<React.SetStateAction<string>>;
  editingVariantIndex: number | null;
  setEditingVariantIndex: React.Dispatch<React.SetStateAction<number | null>>;
}

export function Step4VariantsTags({
  formData,
  setFormData,
  currentTag,
  setCurrentTag,
  currentVariantName,
  setCurrentVariantName,
  currentVariantOption,
  setCurrentVariantOption,
  editingVariantIndex,
  setEditingVariantIndex,
}: Step4VariantsTagsProps) {
  // Tags handlers
  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  // Variants handlers
  const handleAddVariantOption = () => {
    if (!currentVariantOption.trim()) return;

    if (editingVariantIndex !== null) {
      // Update existing variant
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.map((v, i) =>
          i === editingVariantIndex
            ? { ...v, options: [...v.options, currentVariantOption.trim()] }
            : v
        ),
      }));
    } else {
      // Add new variant
      if (!currentVariantName.trim()) return;

      const newVariant: ProductVariant = {
        name: currentVariantName.trim(),
        options: [currentVariantOption.trim()],
      };

      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, newVariant],
      }));

      setCurrentVariantName('');
    }

    setCurrentVariantOption('');
  };

  const handleRemoveVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    if (editingVariantIndex === index) {
      setEditingVariantIndex(null);
      setCurrentVariantName('');
      setCurrentVariantOption('');
    }
  };

  const handleEditVariant = (index: number) => {
    setEditingVariantIndex(index);
    setCurrentVariantName(formData.variants[index].name);
  };

  const handleFinishEditingVariant = () => {
    setEditingVariantIndex(null);
    setCurrentVariantName('');
    setCurrentVariantOption('');
  };

  const handleRemoveVariantOption = (variantIndex: number, optionIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === variantIndex
          ? { ...v, options: v.options.filter((_, oi) => oi !== optionIndex) }
          : v
      ),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6 mb-6"
    >
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        المتغيرات والوسوم
      </h2>

      <div className="space-y-8">
        {/* Variants Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            المتغيرات (اختياري)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            مثل: اللون، الحجم، المقاس
          </p>

          {/* Add/Edit Variant Form */}
          <div className="space-y-3 mb-4">
            {editingVariantIndex === null && (
              <input
                type="text"
                value={currentVariantName}
                onChange={(e) => setCurrentVariantName(e.target.value)}
                placeholder="اسم المتغير (مثل: اللون)"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={currentVariantOption}
                onChange={(e) => setCurrentVariantOption(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddVariantOption()}
                placeholder={
                  editingVariantIndex !== null
                    ? `إضافة خيار لـ ${formData.variants[editingVariantIndex]?.name}`
                    : 'قيمة المتغير (مثل: أحمر)'
                }
                className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddVariantOption}
                disabled={!currentVariantOption.trim() || (editingVariantIndex === null && !currentVariantName.trim())}
                className="px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white disabled:text-gray-500 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
              {editingVariantIndex !== null && (
                <button
                  type="button"
                  onClick={handleFinishEditingVariant}
                  className="px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white transition-colors"
                >
                  <Check className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Variants List */}
          {formData.variants.length > 0 && (
            <div className="space-y-3">
              {formData.variants.map((variant, variantIndex) => (
                <motion.div
                  key={variantIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border-2 ${
                    editingVariantIndex === variantIndex
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {variant.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {variant.options.length} خيار
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditVariant(variantIndex)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(variantIndex)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-red-600 dark:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((option, optionIndex) => (
                      <span
                        key={optionIndex}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-sm text-gray-700 dark:text-gray-300"
                      >
                        {option}
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantOption(variantIndex, optionIndex)}
                          className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            الوسوم (اختياري)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            أضف وسوماً لتسهيل البحث عن المنتج
          </p>

          {/* Add Tag Input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="مثال: جديد، عرض خاص، الأكثر مبيعاً"
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!currentTag.trim()}
              className="px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white disabled:text-gray-500 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Tags List */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
