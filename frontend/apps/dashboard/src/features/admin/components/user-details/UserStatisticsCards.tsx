/**
 * User Statistics Cards Component
 * Displays user statistics in card format
 */

'use client';

import { motion } from 'motion/react';
import { ShoppingCart, DollarSign, Star, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { UserStatistics } from '../../types/user-details.types';

interface UserStatisticsCardsProps {
  statistics?: UserStatistics;
  isLoading?: boolean;
}

export function UserStatisticsCards({ statistics, isLoading }: UserStatisticsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-slate-700" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2" />
                <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'إجمالي الطلبات',
      value: statistics?.totalOrders || 0,
      icon: ShoppingCart,
      gradient: 'from-blue-500 to-cyan-500',
      delay: 0.1,
    },
    {
      title: 'إجمالي المشتريات',
      value: `${(statistics?.totalSpent || 0).toLocaleString('en-US')} ل.س`,
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500',
      delay: 0.2,
    },
    {
      title: 'التقييمات',
      value: statistics?.totalReviews || 0,
      icon: Star,
      gradient: 'from-yellow-500 to-orange-500',
      delay: 0.3,
    },
    {
      title: 'متوسط التقييم',
      value: (statistics?.averageRating || 0) > 0 ? `${statistics.averageRating} ⭐` : 'لا يوجد',
      icon: TrendingUp,
      gradient: 'from-purple-500 to-pink-500',
      delay: 0.4,
    },
  ];

  const orderStatusCards = [
    {
      title: 'طلبات مكتملة',
      value: statistics?.completedOrders || 0,
      icon: CheckCircle,
      gradient: 'from-green-500 to-teal-500',
      delay: 0.5,
    },
    {
      title: 'طلبات ملغاة',
      value: statistics?.cancelledOrders || 0,
      icon: XCircle,
      gradient: 'from-red-500 to-rose-500',
      delay: 0.6,
    },
    {
      title: 'طلبات قيد التنفيذ',
      value: statistics?.pendingOrders || 0,
      icon: Clock,
      gradient: 'from-orange-500 to-amber-500',
      delay: 0.7,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Order Status Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {orderStatusCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: card.delay }}
              className="rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.gradient} flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {card.value}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

