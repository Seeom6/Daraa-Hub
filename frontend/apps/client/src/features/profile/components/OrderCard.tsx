/**
 * OrderCard Component
 * Displays a single order card
 */

'use client';

import { memo, useMemo } from 'react';
import { CheckCircle, Truck, Clock, XCircle, Package, Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
  onClick?: (orderId: string) => void;
  compact?: boolean;
}

const statusConfig = {
  pending: { label: 'قيد الانتظار', icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
  confirmed: { label: 'مؤكد', icon: CheckCircle, color: 'text-blue-500 bg-blue-500/10' },
  preparing: { label: 'قيد التحضير', icon: Package, color: 'text-purple-500 bg-purple-500/10' },
  ready: { label: 'جاهز', icon: CheckCircle, color: 'text-green-500 bg-green-500/10' },
  picked_up: { label: 'تم الاستلام', icon: Truck, color: 'text-blue-500 bg-blue-500/10' },
  delivering: { label: 'قيد التوصيل', icon: Truck, color: 'text-blue-500 bg-blue-500/10' },
  delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
  cancelled: { label: 'ملغي', icon: XCircle, color: 'text-rose-500 bg-rose-500/10' },
} as const;

export const OrderCard = memo(function OrderCard({ order, onClick, compact = false }: OrderCardProps) {
  const StatusIcon = statusConfig[order.orderStatus].icon;
  
  const storeName = useMemo(() => {
    if (typeof order.storeId === 'object' && order.storeId !== null) {
      return order.storeId.businessName;
    }
    return 'متجر';
  }, [order.storeId]);

  const firstProductImage = useMemo(() => {
    return order.items[0]?.productImage || '/placeholder-product.png';
  }, [order.items]);

  const formattedDate = useMemo(() => {
    return new Date(order.createdAt).toLocaleDateString('ar-SY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, [order.createdAt]);

  if (compact) {
    return (
      <div
        className="flex gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
        onClick={() => onClick?.(order._id)}
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-slate-800">
          <img
            src={firstProductImage}
            alt={order.orderNumber}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm truncate">{order.orderNumber}</p>
            <Badge className={statusConfig[order.orderStatus].color}>
              <StatusIcon className="w-3 h-3 ml-1" />
              {statusConfig[order.orderStatus].label}
            </Badge>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{storeName}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">{order.items.length} منتج</span>
            <span className="text-blue-600 dark:text-blue-400">{(order.total || 0).toLocaleString('ar-SY')} ل.س</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group hover:shadow-lg"
      onClick={() => onClick?.(order._id)}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-slate-800">
          <img
            src={firstProductImage}
            alt={order.orderNumber}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <p className="mb-1">{order.orderNumber}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{storeName}</p>
            </div>
            <Badge className={statusConfig[order.orderStatus].color}>
              <StatusIcon className="w-3 h-3 ml-1" />
              {statusConfig[order.orderStatus].label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              {order.items.length} منتج
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg text-blue-600 dark:text-blue-400">
              {(order.total || 0).toLocaleString('ar-SY')} ل.س
            </span>
            <Button variant="outline" size="sm">
              التفاصيل
              <ChevronRight className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

