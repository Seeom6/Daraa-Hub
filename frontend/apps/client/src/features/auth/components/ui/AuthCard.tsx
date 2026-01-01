'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

/**
 * AuthCard Component
 * 
 * Card container for auth pages
 * Features:
 * - Glassmorphism design
 * - Animated entrance
 * - Dark mode support
 */

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export function AuthCard({ children, className = '' }: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

