'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * GradientButton Component
 * 
 * Gradient button for auth pages
 * Features:
 * - Gradient background
 * - Shimmer effect on hover
 * - Loading state
 * - Icon support
 */

interface GradientButtonProps {
  type?: 'button' | 'submit';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  loadingText?: string;
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function GradientButton({
  type = 'button',
  loading = false,
  disabled = false,
  onClick,
  icon,
  loadingText = 'جاري التحميل...',
  children,
  delay = 0,
  className = '',
}: GradientButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <button
        type={type}
        disabled={loading || disabled}
        onClick={onClick}
        className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all rounded-2xl text-base relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <span className="relative flex items-center justify-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {loadingText}
            </>
          ) : (
            <>
              {icon}
              {children}
            </>
          )}
        </span>
      </button>
    </motion.div>
  );
}

