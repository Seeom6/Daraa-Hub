/**
 * OrdersList Component
 * Displays list of orders with loading and empty states
 */

'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderCard } from './OrderCard';
import type { Order } from '../types';

interface OrdersListProps {
  orders: Order[];
  isLoading?: boolean;
  title?: string;
  description?: string;
  onOrderClick?: (orderId: string) => void;
  compact?: boolean;
  maxItems?: number;
}

export const OrdersList = memo(function OrdersList({
  orders,
  isLoading = false,
  title = 'الطلبات',
  description,
  onOrderClick,
  compact = false,
  maxItems,
}: OrdersListProps) {
  const displayOrders = maxItems ? orders.slice(0, maxItems) : orders;

  if (isLoading) {
    return (
      <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            {title}
          </CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">لا توجد طلبات بعد</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {displayOrders.map((order, index) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <OrderCard order={order} onClick={onOrderClick} compact={compact} />
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
});

