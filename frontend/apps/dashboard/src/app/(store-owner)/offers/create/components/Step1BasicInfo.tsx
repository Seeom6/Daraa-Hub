/**
 * Step 1: Basic Info
 * Offer title, description, and image
 */

'use client';

import { Input, Textarea } from '@/components/ui';
import { Upload } from 'lucide-react';
import type { OfferFormData } from '@/features/offers/types';

export interface Step1Props {
  formData: OfferFormData;
  setFormData: (data: OfferFormData) => void;
  errors: Record<string, string>;
}

export function Step1BasicInfo({ formData, setFormData, errors }: Step1Props) {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        المعلومات الأساسية
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          عنوان العرض <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="مثال: خصم 50% على جميع المنتجات"
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
        />
        {errors.title && (
          <p className="text-sm text-red-600 mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          الوصف (اختياري)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          placeholder="اكتب وصفاً تفصيلياً للعرض..."
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all resize-none"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          صورة البانر (اختياري)
        </label>
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-2xl cursor-pointer hover:border-orange-500 dark:hover:border-orange-500 transition-colors overflow-hidden">
          {formData.image ? (
            <div className="relative w-full h-full">
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <p className="text-white font-medium">انقر لتغيير الصورة</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                انقر لرفع صورة أو اسحبها هنا
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG, GIF (الحد الأقصى: 5MB)
              </p>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
      </div>
    </div>
  );
}

