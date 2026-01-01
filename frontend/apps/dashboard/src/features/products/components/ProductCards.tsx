/**
 * Product Cards Component
 * Mobile card view for products
 */

'use client';

import Link from 'next/link';
import { Eye, Edit } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice, getStatusBadge } from '../utils';

interface ProductCardsProps {
  products: Product[];
}

export function ProductCards({ products }: ProductCardsProps) {
  return (
    <div className="lg:hidden divide-y divide-gray-200 dark:divide-slate-800">
      {products.map((product) => {
        const statusBadge = getStatusBadge(product);
        const StatusIcon = statusBadge.showIcon ? statusBadge.icon : null;

        return (
          <div
            key={product._id}
            className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-start gap-4 mb-4">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0 shadow-sm"
                  onError={(e) => {
                    console.error('Image failed to load:', product.images[0]);
                    e.currentTarget.src = '/placeholder-product.png';
                  }}
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gray-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-gray-400">لا صورة</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white mb-1 text-base">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                  {product.categoryAr}
                </p>
                <span className={statusBadge.className}>
                  {StatusIcon && <StatusIcon className="w-3 h-3" />}
                  {statusBadge.label}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">السعر</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {formatPrice(product.price)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">المخزون</p>
                <p
                  className={`font-medium text-sm ${
                    product.inventory &&
                    product.inventory.quantity <= (product.inventory.lowStockThreshold || 10)
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {product.inventory?.quantity ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">المبيعات</p>
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {(product as any).sales ?? (product as any).totalSales ?? 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/products/${product._id}`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-700 text-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                عرض
              </Link>
              <Link
                href={`/products/${product._id}/edit`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-center text-sm font-medium text-white hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                تعديل
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

