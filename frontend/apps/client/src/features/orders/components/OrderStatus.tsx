'use client';

import { OrderStatus as OrderStatusEnum } from '@/features/shared/types/order.types';
import { Clock, CheckCircle, Package, Truck, CheckCheck, XCircle, RotateCcw } from 'lucide-react';

export interface OrderStatusProps {
  status: OrderStatusEnum;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  [OrderStatusEnum.PENDING]: {
    label: 'قيد الانتظار',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: Clock,
  },
  [OrderStatusEnum.CONFIRMED]: {
    label: 'مؤكد',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: CheckCircle,
  },
  [OrderStatusEnum.PROCESSING]: {
    label: 'قيد التجهيز',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    icon: Package,
  },
  [OrderStatusEnum.SHIPPED]: {
    label: 'قيد الشحن',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    icon: Truck,
  },
  [OrderStatusEnum.DELIVERED]: {
    label: 'تم التوصيل',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: CheckCheck,
  },
  [OrderStatusEnum.CANCELLED]: {
    label: 'ملغي',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    icon: XCircle,
  },
  [OrderStatusEnum.RETURNED]: {
    label: 'مرتجع',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: RotateCcw,
  },
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-base',
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export function OrderStatus({ status, size = 'md' }: OrderStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}
    >
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}

