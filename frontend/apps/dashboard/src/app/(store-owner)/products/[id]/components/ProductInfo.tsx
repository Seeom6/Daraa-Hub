/**
 * Product Info Component
 * Display product metadata (SKU, barcode, dates)
 */

'use client';

import { motion } from 'framer-motion';
import { Barcode, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface ProductInfoProps {
  sku?: string;
  barcode?: string;
  createdAt: string;
  updatedAt: string;
}

export function ProductInfo({ sku, barcode, createdAt, updatedAt }: ProductInfoProps) {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: ar });
    } catch {
      return date;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
    >
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Package className="w-5 h-5 text-blue-500" />
        معلومات المنتج
      </h3>
      
      <div className="space-y-4 text-sm">
        {sku && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
              <Barcode className="w-4 h-4" />
              SKU
            </p>
            <p className="font-mono font-medium text-gray-900 dark:text-white">
              {sku}
            </p>
          </div>
        )}
        
        {barcode && (
          <div>
            <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
              <Barcode className="w-4 h-4" />
              الباركود
            </p>
            <p className="font-mono font-medium text-gray-900 dark:text-white">
              {barcode}
            </p>
          </div>
        )}
        
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            تاريخ الإنشاء
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(createdAt)}
          </p>
        </div>
        
        <div>
          <p className="text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            آخر تحديث
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {formatDate(updatedAt)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

