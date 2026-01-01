'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Package, DollarSign, ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';
import type { Order } from '@/features/shared/types/order.types';
import { OrderStatus } from './OrderStatus';

export interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const orderDate = new Date(order.createdAt).toLocaleDateString('ar-SY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/orders/${order._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all cursor-pointer"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">
              طلب #{order.orderNumber}
            </h3>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Calendar className="w-4 h-4" />
              {orderDate}
            </div>
          </div>

          <OrderStatus status={order.status} />
        </div>

        {/* Products Preview */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
          <div className="flex -space-x-2">
            {order.items.slice(0, 3).map((item, index) => (
              <div
                key={item._id}
                className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 border-2 border-gray-900"
                style={{ zIndex: 3 - index }}
              >
                <Image
                  src={item.product.mainImage || item.product.images[0] || '/placeholder.png'}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 text-white/80">
            <Package className="w-4 h-4" />
            <span className="text-sm">
              {order.items.length} {order.items.length === 1 ? 'منتج' : 'منتجات'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold text-white">
              {order.total.toLocaleString()} ل.س
            </span>
          </div>

          <div className="flex items-center gap-1 text-primary text-sm font-medium">
            عرض التفاصيل
            <ChevronLeft className="w-4 h-4" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

