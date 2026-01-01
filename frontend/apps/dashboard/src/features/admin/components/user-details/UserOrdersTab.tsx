/**
 * User Orders Tab Component
 * Displays user orders in table format
 */

'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import type { UserOrder, OrderStatus } from '../../types/user-details.types';

interface UserOrdersTabProps {
  orders: UserOrder[];
  isLoading?: boolean;
}

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'مؤكد',
  processing: 'قيد التنفيذ',
  ready_for_pickup: 'جاهز للاستلام',
  out_for_delivery: 'قيد التوصيل',
  delivered: 'مكتمل',
  cancelled: 'ملغي',
  returned: 'مرتجع',
};

const orderStatusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  confirmed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  processing: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  ready_for_pickup: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  out_for_delivery: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  delivered: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  returned: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
};

export function UserOrdersTab({ orders, isLoading }: UserOrdersTabProps) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ar-SA-u-nu-latn', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              {['رقم الطلب', 'التاريخ', 'عدد المنتجات', 'المبلغ الإجمالي', 'الحالة', 'إجراءات'].map((header) => (
                <th key={header} className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-gray-200 dark:border-slate-700">
                {[...Array(6)].map((_, j) => (
                  <td key={j} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-600 dark:text-gray-400">لا يوجد طلبات</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
        طلبات المستخدم ({orders.length})
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                رقم الطلب
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                التاريخ
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                عدد المنتجات
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                المبلغ الإجمالي
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 dark:text-gray-300 uppercase">
                إجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {orders.map((order) => (
              <tr
                key={order._id}
                className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  #{order.orderNumber}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                  {order.items.length} منتجات
                </td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  {order.total.toLocaleString()} ل.س
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${orderStatusColors[order.orderStatus]}`}>
                    {orderStatusLabels[order.orderStatus]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-sm inline-block"
                  >
                    عرض التفاصيل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

