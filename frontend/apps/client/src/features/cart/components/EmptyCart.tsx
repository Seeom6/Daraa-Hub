'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

export function EmptyCart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center mb-6">
        <ShoppingCart className="w-16 h-16 text-white/40" />
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">السلة فارغة</h2>
      <p className="text-white/60 text-center mb-8 max-w-md">
        لم تقم بإضافة أي منتجات إلى السلة بعد. ابدأ التسوق الآن واكتشف منتجاتنا المميزة!
      </p>

      <Link
        href="/products"
        className="px-8 py-4 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        تصفح المنتجات
      </Link>
    </motion.div>
  );
}

