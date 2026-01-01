/**
 * Product Table Component
 * Desktop table view for products
 */

'use client';

import Link from 'next/link';
import { Eye, Edit, Trash2 } from 'lucide-react';
import type { Product } from '../types';
import { formatPrice, getStatusBadge } from '../utils';

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps) {
  return (
    <table className="hidden lg:table w-full">
      <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <tr>
          <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            المنتج
          </th>
          <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            SKU
          </th>
          <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            السعر
          </th>
          <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            المخزون
          </th>
          <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            المبيعات
          </th>
          <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            الحالة
          </th>
          <th className="text-right px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
            الإجراءات
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
        {products.map((product) => {
          const statusBadge = getStatusBadge(product);
          const StatusIcon = statusBadge.showIcon ? statusBadge.icon : null;

          return (
            <tr
              key={product._id}
              className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', product.images[0]);
                        e.currentTarget.src = '/placeholder-product.png';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                      <span className="text-xs text-gray-400">لا صورة</span>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.categoryAr}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {product.sku || '-'}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatPrice(product.price)}
                </p>
                {product.compareAtPrice && (
                  <p className="text-sm text-gray-500 dark:text-gray-500 line-through">
                    {formatPrice(product.compareAtPrice)}
                  </p>
                )}
              </td>
              <td className="px-6 py-4">
                <p
                  className={`font-medium ${
                    product.inventory &&
                    product.inventory.quantity <= (product.inventory.lowStockThreshold || 10)
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {product.inventory?.quantity ?? '-'}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {(product as any).sales ?? (product as any).totalSales ?? 0} مبيعات
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {(product as any).views ?? 0} مشاهدة
                </p>
              </td>
              <td className="px-6 py-4">
                <span className={statusBadge.className}>
                  {StatusIcon && <StatusIcon className="w-3 h-3" />}
                  {statusBadge.label}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/products/${product._id}`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="عرض"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/products/${product._id}/edit`}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    title="تعديل"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

