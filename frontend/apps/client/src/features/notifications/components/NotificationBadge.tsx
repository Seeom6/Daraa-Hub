'use client';

import { motion, AnimatePresence } from 'motion/react';

export interface NotificationBadgeProps {
  count: number;
  max?: number;
}

export function NotificationBadge({ count, max = 99 }: NotificationBadgeProps) {
  if (count === 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="absolute -top-1 -left-1 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1.5"
      >
        {displayCount}
      </motion.div>
    </AnimatePresence>
  );
}

