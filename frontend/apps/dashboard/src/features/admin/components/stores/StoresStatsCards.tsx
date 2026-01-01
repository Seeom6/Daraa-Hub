'use client';

/**
 * Stores Stats Cards Component
 * Displays statistics cards for stores overview
 */

import { motion } from 'framer-motion';
import { Store, CheckCircle, XCircle, DollarSign, Package, ShoppingCart, Star } from 'lucide-react';
import { Card } from '@/components/ui';
import { Skeleton } from '@/components/common';

interface StoresStatsCardsProps {
  statistics?: {
    totalStores: number;
    activeStores: number;
    inactiveStores: number;
    suspendedStores: number;
    totalRevenue: number;
    totalProducts: number;
    totalOrders: number;
    averageRating: number;
  };
  isLoading?: boolean;
}

export function StoresStatsCards({ statistics, isLoading }: StoresStatsCardsProps) {
  const stats = [
    {
      title: 'إجمالي المتاجر',
      value: statistics?.totalStores || 0,
      icon: Store,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'المتاجر النشطة',
      value: statistics?.activeStores || 0,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'المتاجر المعلقة',
      value: statistics?.suspendedStores || 0,
      icon: XCircle,
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400',
    },
    {
      title: 'إجمالي الإيرادات',
      value: `${(statistics?.totalRevenue || 0).toLocaleString('en-US')} ل.س`,
      icon: DollarSign,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'إجمالي المنتجات',
      value: statistics?.totalProducts || 0,
      icon: Package,
      color: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'إجمالي الطلبات',
      value: statistics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-500/10',
      textColor: 'text-indigo-600 dark:text-indigo-400',
    },
    {
      title: 'متوسط التقييم',
      value: (statistics?.averageRating || 0).toFixed(1),
      icon: Star,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10',
      textColor: 'text-yellow-600 dark:text-yellow-400',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
              
              {/* Gradient Background */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
              />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

