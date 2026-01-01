'use client';

import { ReactNode, InputHTMLAttributes } from 'react';

/**
 * StyledInput Component
 * 
 * Styled input field for auth pages
 * Features:
 * - Icon support (left & right)
 * - Focus effects
 * - Dark mode support
 */

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rightAction?: ReactNode;
}

export function StyledInput({
  leftIcon,
  rightIcon,
  rightAction,
  className = '',
  ...props
}: StyledInputProps) {
  return (
    <div className="relative group">
      {/* Right Icon */}
      {rightIcon && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
          {rightIcon}
        </div>
      )}

      {/* Input */}
      <input
        {...props}
        className={`w-full h-14 ${rightIcon ? 'pr-12' : 'pr-4'} ${
          leftIcon || rightAction ? 'pl-12' : 'pl-4'
        } bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-900 dark:text-gray-100 placeholder:text-gray-400 ${className}`}
      />

      {/* Left Icon or Action */}
      {leftIcon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          {leftIcon}
        </div>
      )}
      {rightAction && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2">
          {rightAction}
        </div>
      )}
    </div>
  );
}

