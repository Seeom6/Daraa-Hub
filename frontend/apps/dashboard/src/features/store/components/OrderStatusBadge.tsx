/**
 * OrderStatusBadge Component
 * Display order status with appropriate styling
 */

import { Badge } from '@/components/ui';
import type { OrderStatus } from '../types';

export interface OrderStatusBadgeProps {
  status: OrderStatus;
  showDot?: boolean;
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'default' }> = {
  pending: { label: 'قيد الانتظار', variant: 'warning' },
  processing: { label: 'قيد المعالجة', variant: 'info' },
  shipped: { label: 'قيد الشحن', variant: 'info' },
  delivered: { label: 'تم التوصيل', variant: 'success' },
  cancelled: { label: 'ملغي', variant: 'error' },
  refunded: { label: 'مسترد', variant: 'default' },
};

export function OrderStatusBadge({ status, showDot = true }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot={showDot}>
      {config.label}
    </Badge>
  );
}

