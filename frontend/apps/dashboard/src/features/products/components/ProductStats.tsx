/**
 * Product Stats Component
 * Displays product statistics cards
 */

'use client';

import { motion } from 'framer-motion';
import type { ProductStats as ProductStatsType } from '../types';

interface ProductStatsProps {
  stats: ProductStatsType;
}

export function ProductStats({ stats }: ProductStatsProps) {
  const statCards = [
    {
      label: 'إجمالي المنتجات',
      value: stats.total,
      color: 'text-gray-900 dark:text-white',
    },
    {
      label: 'المنتجات النشطة',
      value: stats.active,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'مخزون منخفض',
      value: stats.lowStock,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: 'نفذ من المخزون',
      value: stats.outOfStock,
      color: 'text-red-600 dark:text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

