/**
 * Step 3: Applicable Products
 * Select which products the offer applies to
 */

'use client';

import { useState } from 'react';
import { Search, CheckCircle } from 'lucide-react';
import { useProducts } from '@/features/store/hooks/useProducts';
import type { OfferFormData } from '@/features/offers/types';

export interface Step3Props {
  formData: OfferFormData;
  setFormData: (data: OfferFormData) => void;
  errors: Record<string, string>;
  storeId: string;
}

export function Step3Products({ formData, setFormData, errors, storeId }: Step3Props) {
  const [search, setSearch] = useState('');

  const { products, isLoading } = useProducts({
    storeId,
    search,
    limit: 50,
  });

  const handleToggleProduct = (productId: string) => {
    const isSelected = formData.selectedProducts.includes(productId);

    if (isSelected) {
      setFormData({
        ...formData,
        selectedProducts: formData.selectedProducts.filter((id) => id !== productId),
      });
    } else {
      setFormData({
        ...formData,
        selectedProducts: [...formData.selectedProducts, productId],
      });
    }
  };

  const handleToggleAll = () => {
    setFormData({
      ...formData,
      applyToAllProducts: !formData.applyToAllProducts,
      selectedProducts: [],
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        المنتجات المطبقة
      </h2>

      {/* Apply to All Products Toggle */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.applyToAllProducts}
            onChange={handleToggleAll}
            className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
          />
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              تطبيق على جميع المنتجات
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              سيتم تطبيق العرض على جميع منتجات المتجر
            </div>
          </div>
        </label>
      </div>

      {/* Product Selection */}
      {!formData.applyToAllProducts && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            اختر المنتجات ({formData.selectedProducts.length} محدد)
          </h3>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 pr-10 rounded-xl bg-gray-100 dark:bg-slate-800 border border-transparent focus:border-orange-500 dark:focus:border-orange-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none transition-all"
            />
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-2 p-8 text-center text-gray-500">جاري التحميل...</div>
            ) : products.length === 0 ? (
              <div className="col-span-2 p-8 text-center text-gray-500">لا توجد منتجات</div>
            ) : (
              products.map((product) => {
                const isSelected = formData.selectedProducts.includes(product._id);
                return (
                  <button
                    key={product._id}
                    type="button"
                    onClick={() => handleToggleProduct(product._id)}
                    className={`p-4 rounded-xl border-2 transition-all text-right ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {product.images && product.images.length > 0 && (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {product.price.toLocaleString('ar-SY')} ل.س
                        </div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-orange-600" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

