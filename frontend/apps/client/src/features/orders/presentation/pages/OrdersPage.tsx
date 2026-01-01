'use client';

import { useState } from 'react';
import { Package, Search } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { OrderCard } from '@/features/orders/components';
import { useOrders } from '@/features/orders/hooks/useOrders';
import { OrderStatus as OrderStatusEnum } from '@/features/shared/types/order.types';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

const statusFilters = [
  { value: '', label: 'الكل' },
  { value: OrderStatusEnum.PENDING, label: 'قيد الانتظار' },
  { value: OrderStatusEnum.CONFIRMED, label: 'مؤكد' },
  { value: OrderStatusEnum.PROCESSING, label: 'قيد التجهيز' },
  { value: OrderStatusEnum.SHIPPED, label: 'قيد الشحن' },
  { value: OrderStatusEnum.DELIVERED, label: 'تم التوصيل' },
  { value: OrderStatusEnum.CANCELLED, label: 'ملغي' },
];

export function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useOrders({
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorMessage message="حدث خطأ أثناء تحميل الطلبات" variant="card" />
      </div>
    );
  }

  const orders = data?.orders || [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Package className="w-8 h-8" />
          طلباتي
        </h1>
        <p className="text-white/60">
          {data?.total || 0} {data?.total === 1 ? 'طلب' : 'طلبات'}
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الطلب..."
            className="w-full pr-10 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.value
                  ? 'bg-primary text-white'
                  : 'bg-white/5 text-white/80 hover:bg-white/10'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">لا توجد طلبات</h3>
          <p className="text-white/60">لم تقم بإنشاء أي طلبات بعد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

