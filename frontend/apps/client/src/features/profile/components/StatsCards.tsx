/**
 * StatsCards Component
 * Displays profile statistics cards
 */

'use client';

import { memo } from 'react';
import { motion } from 'motion/react';
import { Package, Star, Heart, Gift, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { ProfileStats } from '../types';

interface StatCardData {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

interface StatsCardsProps {
  stats?: ProfileStats;
  tierName?: string;
}

export const StatsCards = memo(function StatsCards({ stats, tierName }: StatsCardsProps) {
  const statsData: StatCardData[] = [
    {
      label: 'إجمالي الطلبات',
      value: (stats?.totalOrders || 0).toString(),
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'النقاط المتاحة',
      value: (stats?.loyaltyPoints || 0).toLocaleString('en-US'),
      icon: Star,
      color: 'from-amber-500 to-orange-600',
    },
    {
      label: 'قائمة الأمنيات',
      value: (stats?.wishlistCount || 0).toString(),
      icon: Heart,
      color: 'from-rose-500 to-pink-600',
    },
    {
      label: `الخصم الحالي ${stats?.currentDiscount || 0}%`,
      value: tierName || 'برونزي',
      icon: Gift,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="backdrop-blur-xl bg-white/90 dark:bg-slate-900/90 border-white/50 dark:border-slate-800/50 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

