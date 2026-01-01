'use client';

import { motion } from 'motion/react';

/**
 * AuthHeader Component
 * 
 * Header for auth pages
 * Features:
 * - Gradient title
 * - Subtitle
 * - Animated entrance
 */

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  emoji?: string;
}

export function AuthHeader({ title, subtitle, emoji }: AuthHeaderProps) {
  return (
    <div className="p-8 pb-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h1 className="text-2xl mb-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          {title} {emoji}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{subtitle}</p>
      </motion.div>
    </div>
  );
}

