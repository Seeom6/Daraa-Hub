/**
 * Orders List Page
 * Display and manage all orders
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Select, Badge } from '@/components/ui';
import { LoadingState, ErrorState, EmptyState } from '@/components/common';
import { OrderStatusBadge } from '@/features/store/components';
import { useOrders } from '@/features/store/hooks';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ShoppingBag, Eye } from 'lucide-react';
import type { OrderFilters } from '@/features/store/types';

export default function OrdersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<OrderFilters>({});

  const { orders, isLoading, error, refetch } = useOrders(filters);

  const handleStatusFilter = (status: string) => {
    if (status === 'all') {
      const { status: _, ...rest } = filters;
      setFilters(rest);
    } else {
      setFilters({ ...filters, status: status as any });
    }
  };

  if (isLoading) {
    return <LoadingState message="جاري تحميل الطلبات..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="فشل تحميل الطلبات"
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          الطلبات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إدارة طلبات متجرك
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select
          options={[
            { value: 'all', label: 'جميع الطلبات' },
            { value: 'pending', label: 'قيد الانتظار' },
            { value: 'confirmed', label: 'مؤكد' },
            { value: 'processing', label: 'قيد المعالجة' },
            { value: 'shipped', label: 'قيد الشحن' },
            { value: 'delivered', label: 'تم التوصيل' },
            { value: 'cancelled', label: 'ملغي' },
          ]}
          onChange={(e) => handleStatusFilter(e.target.value)}
          defaultValue="all"
        />
      </div>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card
              key={order._id}
              hover
              className="cursor-pointer"
              onClick={() => router.push(`/orders/${order._id}`)}
            >
              <div className="flex items-center justify-between">
                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      طلب #{order.orderNumber}
                    </h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{order.customer?.fullName || 'عميل'}</span>
                    <span>•</span>
                    <span>{order.items?.length || 0} منتج</span>
                    <span>•</span>
                    <span>{formatDateTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-left ml-6">
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(order.total)}
                  </p>
                </div>

                {/* View Button */}
                <button
                  className="p-3 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/orders/${order._id}`);
                  }}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ShoppingBag className="w-12 h-12" />}
          title="لا توجد طلبات"
          description="لم تستلم أي طلبات بعد"
        />
      )}
    </div>
  );
}

