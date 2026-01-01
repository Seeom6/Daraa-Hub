/**
 * Product Variants Component
 * Display product variants (color, size, etc.)
 */

'use client';

import { motion } from 'framer-motion';
import { Layers } from 'lucide-react';

interface ProductVariant {
  name: string;
  options: string[];
}

interface ProductVariantsProps {
  variants: ProductVariant[];
}

export function ProductVariants({ variants }: ProductVariantsProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-6"
    >
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-cyan-500" />
        المتغيرات
      </h3>
      
      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div key={index}>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {variant.name}:
            </p>
            <div className="flex flex-wrap gap-2">
              {variant.options.map((option, optIndex) => (
                <span
                  key={optIndex}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm text-gray-900 dark:text-white"
                >
                  {option}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

