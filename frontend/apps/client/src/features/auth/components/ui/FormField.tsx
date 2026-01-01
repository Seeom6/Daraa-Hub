'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

/**
 * FormField Component
 * 
 * Animated form field wrapper
 * Features:
 * - Animated entrance
 * - Icon support
 * - Label with required indicator
 * - Error message
 */

interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  delay?: number;
  children: ReactNode;
}

export function FormField({
  label,
  required = false,
  optional = false,
  error,
  delay = 0,
  children,
}: FormFieldProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="space-y-2"
    >
      <label className="text-sm text-gray-700 dark:text-gray-300 block">
        {label}{' '}
        {required && <span className="text-red-500">*</span>}
        {optional && <span className="text-gray-400 text-xs">(اختياري)</span>}
      </label>
      {children}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

