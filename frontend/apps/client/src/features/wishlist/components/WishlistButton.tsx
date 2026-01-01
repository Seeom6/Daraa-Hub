'use client';

import { Heart } from 'lucide-react';
import { motion } from 'motion/react';

export interface WishlistButtonProps {
  productId: string;
  isInWishlist: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function WishlistButton({
  isInWishlist,
  onToggle,
  size = 'md',
}: WishlistButtonProps) {
  return (
    <motion.button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={`${sizeClasses[size]} rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors`}
    >
      <Heart
        className={`${iconSizes[size]} ${
          isInWishlist
            ? 'fill-red-500 text-red-500'
            : 'fill-transparent text-white'
        } transition-colors`}
      />
    </motion.button>
  );
}

