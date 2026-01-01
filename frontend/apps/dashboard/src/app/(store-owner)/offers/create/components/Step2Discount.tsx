/**
 * Step 2: Discount Details
 * Discount type, value, and conditions
 */

'use client';

import { Input } from '@/components/ui';
import type { OfferFormData, DiscountType } from '@/features/offers/types';

export interface Step2Props {
  formData: OfferFormData;
  setFormData: (data: OfferFormData) => void;
  errors: Record<string, string>;
}

export function Step2Discount({ formData, setFormData, errors }: Step2Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        تفاصيل الخصم
      </h2>

      {/* Discount Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          نوع الخصم <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, discountType: 'percentage' as DiscountType })
            }
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.discountType === 'percentage'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">%</div>
              <div className="font-medium text-gray-900 dark:text-white">نسبة مئوية</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">مثال: 25%</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, discountType: 'fixed' as DiscountType })
            }
            className={`p-4 rounded-xl border-2 transition-all ${
              formData.discountType === 'fixed'
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">ل.س</div>
              <div className="font-medium text-gray-900 dark:text-white">مبلغ ثابت</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">مثال: 50,000</div>
            </div>
          </button>
        </div>
      </div>

      {/* Discount Value */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          قيمة الخصم <span className="text-red-500">*</span>
          {formData.discountType === 'percentage' ? ' (%)' : ' (ل.س)'}
        </label>
        <input
          type="number"
          value={formData.discountValue}
          onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
          placeholder={formData.discountType === 'percentage' ? 'مثال: 25' : 'مثال: 50000'}
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
        />
        {errors.discountValue && (
          <p className="text-sm text-red-600 mt-1">{errors.discountValue}</p>
        )}
      </div>

      {/* Min Purchase Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          الحد الأدنى للشراء (ل.س) - اختياري
        </label>
        <input
          type="number"
          value={formData.minPurchaseAmount}
          onChange={(e) => setFormData({ ...formData, minPurchaseAmount: e.target.value })}
          placeholder="مثال: 100000"
          className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          الحد الأدنى لقيمة الطلب لتطبيق العرض
        </p>
      </div>

      {/* Max Discount Amount (for percentage only) */}
      {formData.discountType === 'percentage' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            الحد الأقصى للخصم (ل.س) - اختياري
          </label>
          <input
            type="number"
            value={formData.maxDiscountAmount}
            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
            placeholder="مثال: 200000"
            className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            الحد الأقصى لقيمة الخصم (مفيد للنسب المئوية الكبيرة)
          </p>
        </div>
      )}

      {/* Preview */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 border border-orange-200 dark:border-orange-800">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">معاينة الخصم:</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {formData.discountType === 'percentage'
            ? `خصم ${formData.discountValue}%`
            : `خصم ${parseFloat(formData.discountValue || '0').toLocaleString('ar-SY')} ل.س`}
        </p>
        {formData.minPurchaseAmount && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            الحد الأدنى: {parseFloat(formData.minPurchaseAmount).toLocaleString('ar-SY')} ل.س
          </p>
        )}
        {formData.maxDiscountAmount && formData.discountType === 'percentage' && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            الحد الأقصى: {parseFloat(formData.maxDiscountAmount).toLocaleString('ar-SY')} ل.س
          </p>
        )}
      </div>
    </div>
  );
}

