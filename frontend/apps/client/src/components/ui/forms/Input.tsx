'use client';

/**
 * Input Component
 * 
 * Reusable input field with:
 * - RTL support
 * - Error states
 * - Icons
 * - Different variants
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'filled' | 'outlined';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      variant = 'default',
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      // Base styles
      'w-full px-4 py-3 rounded-lg transition-all duration-200',
      'text-base text-gray-900 dark:text-white',
      'placeholder:text-gray-400 dark:placeholder:text-gray-500',
      'focus:outline-none focus:ring-2',
      
      // RTL support
      'text-right',
      
      // Icon padding
      leftIcon && 'pr-12',
      rightIcon && 'pl-12',
      
      // Variants
      variant === 'default' && [
        'bg-white dark:bg-gray-800',
        'border border-gray-300 dark:border-gray-600',
        'focus:border-primary-500 focus:ring-primary-500/20',
      ],
      variant === 'filled' && [
        'bg-gray-100 dark:bg-gray-700',
        'border border-transparent',
        'focus:bg-white dark:focus:bg-gray-800',
        'focus:border-primary-500 focus:ring-primary-500/20',
      ],
      variant === 'outlined' && [
        'bg-transparent',
        'border-2 border-gray-300 dark:border-gray-600',
        'focus:border-primary-500 focus:ring-primary-500/20',
      ],
      
      // Error state
      error && [
        'border-red-500 dark:border-red-500',
        'focus:border-red-500 focus:ring-red-500/20',
      ],
      
      // Disabled state
      disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800',
      
      className
    );

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-right">
            {label}
            {props.required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon (RTL: appears on right) */}
          {leftIcon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            type={type}
            className={baseStyles}
            ref={ref}
            disabled={disabled}
            {...props}
          />

          {/* Right Icon (RTL: appears on left) */}
          {rightIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-right">
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

