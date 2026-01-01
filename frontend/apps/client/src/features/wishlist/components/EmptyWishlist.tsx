'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

export function EmptyWishlist() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
        <Heart className="w-12 h-12 text-white/40" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">المفضلة فارغة</h3>
      <p className="text-white/60 mb-6">لم تقم بإضافة أي منتجات للمفضلة بعد</p>
      <Link
        href="/products"
        className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        تصفح المنتجات
      </Link>
    </motion.div>
  );
}

