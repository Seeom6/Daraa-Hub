'use client';

import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  CreditCard,
  MessageCircle,
  TrendingDown,
  Gift,
  Settings,
} from 'lucide-react';
import type { NotificationType } from '../types/notifications.types';

export interface NotificationIconProps {
  type: NotificationType;
  className?: string;
}

const iconMap: Record<NotificationType, { Icon: any; color: string }> = {
  order_placed: { Icon: Package, color: 'text-blue-400' },
  order_shipped: { Icon: Truck, color: 'text-cyan-400' },
  order_delivered: { Icon: CheckCircle, color: 'text-green-400' },
  order_cancelled: { Icon: XCircle, color: 'text-red-400' },
  payment_received: { Icon: CreditCard, color: 'text-green-400' },
  review_reply: { Icon: MessageCircle, color: 'text-purple-400' },
  price_drop: { Icon: TrendingDown, color: 'text-orange-400' },
  back_in_stock: { Icon: Package, color: 'text-green-400' },
  promo: { Icon: Gift, color: 'text-pink-400' },
  system: { Icon: Settings, color: 'text-gray-400' },
};

export function NotificationIcon({ type, className = '' }: NotificationIconProps) {
  const { Icon, color } = iconMap[type];

  return <Icon className={`${color} ${className}`} />;
}

