'use client';

import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Coupon } from '../types/cart.types';

export interface CouponInputProps {
  coupon?: Coupon;
  onApply: (code: string) => void;
  onRemove: () => void;
  isLoading?: boolean;
}

export function CouponInput({ coupon, onApply, onRemove, isLoading }: CouponInputProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      onApply(code.trim());
    }
  };

  if (coupon) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-white font-medium">{coupon.code}</p>
              <p className="text-sm text-green-400">
                {coupon.type === 'percentage'
                  ? `خصم ${coupon.value}%`
                  : `خصم ${coupon.value.toLocaleString()} ل.س`}
              </p>
            </div>
          </div>

          <button
            onClick={onRemove}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="إزالة الكوبون"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
      <label className="block text-white font-medium mb-2">
        هل لديك كوبون خصم؟
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="أدخل كود الخصم"
            disabled={isLoading}
            className="w-full pr-10 pl-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
        </div>

        <motion.button
          type="submit"
          disabled={!code.trim() || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'جاري التطبيق...' : 'تطبيق'}
        </motion.button>
      </div>
    </form>
  );
}

