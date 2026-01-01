/**
 * Product Stats Component
 * Display product statistics (sales, views, rating, inventory)
 */

'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Eye, Star, Package } from 'lucide-react';

interface ProductStatsProps {
  sales?: number;
  views?: number;
  rating?: number;
  inventory?: {
    quantity: number;
    lowStockThreshold?: number;
  };
}

export function ProductStats({ sales, views, rating, inventory }: ProductStatsProps) {
  const isLowStock = inventory && inventory.lowStockThreshold
    ? inventory.quantity <= inventory.lowStockThreshold
    : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
    >
      <h3 className="font-bold text-gray-900 dark:text-white mb-4">الإحصائيات</h3>
      
      <div className="space-y-3">
        {sales !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              المبيعات
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{sales}</span>
          </div>
        )}
        
        {views !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              المشاهدات
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{views}</span>
          </div>
        )}
        
        {rating !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Star className="w-4 h-4" />
              التقييم
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{rating} ⭐</span>
          </div>
        )}
        
        {inventory && (
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Package className="w-4 h-4" />
              المخزون
            </span>
            <span className={`font-bold ${
              isLowStock
                ? 'text-orange-500'
                : 'text-green-500'
            }`}>
              {inventory.quantity}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

