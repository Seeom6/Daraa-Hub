'use client';

import { motion } from 'motion/react';
import { OrderStatus as OrderStatusEnum } from '@/features/shared/types/order.types';
import { Clock, CheckCircle, Package, Truck, CheckCheck, XCircle } from 'lucide-react';

export interface TimelineEvent {
  status: OrderStatusEnum;
  date: string;
  description: string;
}

export interface OrderTimelineProps {
  events: TimelineEvent[];
  currentStatus: OrderStatusEnum;
}

const statusIcons = {
  [OrderStatusEnum.PENDING]: Clock,
  [OrderStatusEnum.CONFIRMED]: CheckCircle,
  [OrderStatusEnum.PROCESSING]: Package,
  [OrderStatusEnum.SHIPPED]: Truck,
  [OrderStatusEnum.DELIVERED]: CheckCheck,
  [OrderStatusEnum.CANCELLED]: XCircle,
  [OrderStatusEnum.RETURNED]: XCircle,
};

const statusLabels = {
  [OrderStatusEnum.PENDING]: 'قيد الانتظار',
  [OrderStatusEnum.CONFIRMED]: 'تم التأكيد',
  [OrderStatusEnum.PROCESSING]: 'قيد التجهيز',
  [OrderStatusEnum.SHIPPED]: 'تم الشحن',
  [OrderStatusEnum.DELIVERED]: 'تم التوصيل',
  [OrderStatusEnum.CANCELLED]: 'تم الإلغاء',
  [OrderStatusEnum.RETURNED]: 'تم الإرجاع',
};

export function OrderTimeline({ events, currentStatus }: OrderTimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">تتبع الطلب</h3>

      <div className="space-y-6">
        {sortedEvents.map((event, index) => {
          const Icon = statusIcons[event.status];
          const isLast = index === sortedEvents.length - 1;
          const isCurrent = event.status === currentStatus;
          const eventDate = new Date(event.date).toLocaleDateString('ar-SY', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div key={index} className="flex gap-4">
              {/* Icon & Line */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isCurrent
                      ? 'bg-primary text-white'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>

                {!isLast && (
                  <div className="w-0.5 h-12 bg-white/10 mt-2" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-2">
                <h4
                  className={`font-medium mb-1 ${
                    isCurrent ? 'text-white' : 'text-white/80'
                  }`}
                >
                  {statusLabels[event.status]}
                </h4>
                <p className="text-sm text-white/60 mb-1">{event.description}</p>
                <p className="text-xs text-white/40">{eventDate}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

