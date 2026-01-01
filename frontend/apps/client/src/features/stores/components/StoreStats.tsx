'use client';

import { Package, Star, Users, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

export interface StoreStatsProps {
  productsCount: number;
  rating: number;
  reviewsCount: number;
  followersCount: number;
  salesCount?: number;
}

const statItems = [
  {
    key: 'products',
    icon: Package,
    label: 'المنتجات',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
  },
  {
    key: 'rating',
    icon: Star,
    label: 'التقييم',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
  },
  {
    key: 'followers',
    icon: Users,
    label: 'المتابعون',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  {
    key: 'sales',
    icon: ShoppingBag,
    label: 'المبيعات',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
  },
];

export function StoreStats({
  productsCount,
  rating,
  reviewsCount,
  followersCount,
  salesCount = 0,
}: StoreStatsProps) {
  const stats = {
    products: productsCount,
    rating: rating.toFixed(1),
    followers: followersCount >= 1000 ? `${(followersCount / 1000).toFixed(1)}K` : followersCount,
    sales: salesCount >= 1000 ? `${(salesCount / 1000).toFixed(1)}K+` : `${salesCount}+`,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        const value = stats[item.key as keyof typeof stats];

        return (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 text-center"
          >
            <div className={`w-12 h-12 ${item.bgColor} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <Icon className={`w-6 h-6 ${item.color}`} />
            </div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-sm text-white/60">{item.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

