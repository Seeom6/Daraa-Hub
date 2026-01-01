/**
 * Step 4: Schedule and Activation
 * Set start/end dates and activation status
 */

'use client';

import type { OfferFormData } from '@/features/offers/types';

export interface Step4Props {
  formData: OfferFormData;
  setFormData: (data: OfferFormData) => void;
  errors: Record<string, string>;
}

export function Step4Schedule({ formData, setFormData, errors }: Step4Props) {
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (value: string) => {
    setFormData({ ...formData, startDate: new Date(value) });
  };

  const handleEndDateChange = (value: string) => {
    setFormData({ ...formData, endDate: new Date(value) });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        الجدولة والتفعيل
      </h2>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            تاريخ البدء <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formatDateForInput(formData.startDate)}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white focus:outline-none transition-all"
          />
          {errors.startDate && (
            <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            تاريخ الانتهاء <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={formatDateForInput(formData.endDate)}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white focus:outline-none transition-all"
          />
          {errors.endDate && (
            <p className="text-sm text-red-600 mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Active Status */}
      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              تفعيل العرض فوراً
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              سيكون العرض مرئياً للعملاء فور الإنشاء
            </div>
          </div>
        </label>
      </div>

      {/* Summary */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-800">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          📋 ملخص العرض
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">العنوان</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.title || '-'}
            </span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">نوع الخصم</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.discountType === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت'}
            </span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">قيمة الخصم</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {formData.discountValue}
              {formData.discountType === 'percentage' ? '%' : ' ل.س'}
            </span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">المنتجات</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formData.applyToAllProducts
                ? 'جميع المنتجات'
                : `${formData.selectedProducts.length} منتج`}
            </span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">المدة</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {Math.ceil(
                (formData.endDate.getTime() - formData.startDate.getTime()) /
                  (1000 * 60 * 60 * 24)
              )}{' '}
              يوم
            </span>
          </div>
          <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">الحالة</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              formData.isActive
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
            }`}>
              {formData.isActive ? '✓ نشط' : '○ غير نشط'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

