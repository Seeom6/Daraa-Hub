'use client';

import { motion } from 'motion/react';
import { ShoppingCart, Tag, Truck, DollarSign } from 'lucide-react';
import type { Coupon } from '../types/cart.types';

export interface CartSummaryProps {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: Coupon;
  onCheckout?: () => void;
  isCheckoutDisabled?: boolean;
}

export function CartSummary({
  subtotal,
  discount,
  shipping,
  total,
  coupon,
  onCheckout,
  isCheckoutDisabled,
}: CartSummaryProps) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 sticky top-24">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ShoppingCart className="w-5 h-5" />
        ملخص الطلب
      </h3>

      <div className="space-y-3 mb-6">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-white/80">
          <span>المجموع الفرعي</span>
          <span className="font-medium">{subtotal.toLocaleString()} ل.س</span>
        </div>

        {/* Discount */}
        {discount > 0 && (
          <div className="flex items-center justify-between text-green-400">
            <span className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              الخصم
              {coupon && <span className="text-xs">({coupon.code})</span>}
            </span>
            <span className="font-medium">-{discount.toLocaleString()} ل.س</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex items-center justify-between text-white/80">
          <span className="flex items-center gap-1">
            <Truck className="w-4 h-4" />
            الشحن
          </span>
          <span className="font-medium">
            {shipping === 0 ? 'مجاني' : `${shipping.toLocaleString()} ل.س`}
          </span>
        </div>

        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between text-white text-lg font-bold">
            <span className="flex items-center gap-1">
              <DollarSign className="w-5 h-5" />
              المجموع الكلي
            </span>
            <span className="text-primary">{total.toLocaleString()} ل.س</span>
          </div>
        </div>
      </div>

      {onCheckout && (
        <motion.button
          onClick={onCheckout}
          disabled={isCheckoutDisabled}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          متابعة الدفع
        </motion.button>
      )}

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-400 text-center">
          🎉 شحن مجاني للطلبات فوق 50,000 ل.س
        </p>
      </div>
    </div>
  );
}

