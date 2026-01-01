'use client';

/**
 * Stores Table Component
 * Displays stores list in a table format with actions
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Ban, CheckCircle, Trash2, Star, Package, ShoppingCart } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { Skeleton } from '@/components/common';
import type { Store } from '../../types/stores.types';

interface StoresTableProps {
  stores: Store[];
  isLoading?: boolean;
  onSuspend?: (storeId: string) => void;
  onUnsuspend?: (storeId: string) => void;
  onDelete?: (storeId: string) => void;
}

export function StoresTable({ stores, isLoading, onSuspend, onUnsuspend, onDelete }: StoresTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشط', variant: 'success' as const },
      inactive: { label: 'غير نشط', variant: 'default' as const },
      suspended: { label: 'معلق', variant: 'error' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'قيد الانتظار', variant: 'warning' as const },
      approved: { label: 'موافق عليه', variant: 'success' as const },
      rejected: { label: 'مرفوض', variant: 'error' as const },
      info_required: { label: 'معلومات مطلوبة', variant: 'info' as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <Card>
        <div className="p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            لا توجد متاجر
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            لم يتم العثور على أي متاجر مطابقة للفلاتر المحددة
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                المتجر
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                المالك
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                التوثيق
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الإحصائيات
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {stores.map((store, index) => (
              <motion.tr
                key={store._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <Link
                      href={`/admin/stores/${store._id}`}
                      className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {store.storeName}
                    </Link>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {store.businessAddress?.city || 'غير محدد'}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {store.owner?.fullName || 'غير محدد'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {store.owner?.phone || store.businessPhone}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(store.status)}</td>
                <td className="px-6 py-4">{getVerificationBadge(store.verificationStatus)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{store.rating?.toFixed(1) || '0.0'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-blue-500" />
                      <span>{store.totalProducts || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="w-4 h-4 text-green-500" />
                      <span>{store.totalOrders || 0}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/stores/${store._id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {store.status === 'suspended' ? (
                      <button
                        onClick={() => onUnsuspend?.(store._id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="إلغاء التعليق"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onSuspend?.(store._id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="تعليق المتجر"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onDelete?.(store._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="حذف المتجر"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

