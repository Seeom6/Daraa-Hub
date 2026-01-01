/**
 * Product Pricing Component
 * Display product price with discount information
 */

'use client';

import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';

interface ProductPricingProps {
  price: number;
  compareAtPrice?: number;
  discount: number;
  formatPrice: (price: number) => string;
}

export function ProductPricing({
  price,
  compareAtPrice,
  discount,
  formatPrice,
}: ProductPricingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white shadow-xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5" />
        <h3 className="font-bold">السعر</h3>
      </div>
      
      <p className="text-4xl font-bold mb-2">{formatPrice(price)}</p>
      
      {compareAtPrice && (
        <div className="flex items-center gap-2">
          <p className="text-white/70 line-through text-lg">
            {formatPrice(compareAtPrice)}
          </p>
          <span className="px-3 py-1 rounded-lg bg-white/20 text-sm font-bold">
            -{discount}٪
          </span>
        </div>
      )}
    </motion.div>
  );
}

