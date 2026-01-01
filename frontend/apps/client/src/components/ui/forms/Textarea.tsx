'use client';

/**
 * Textarea Component
 * 
 * Reusable textarea field with RTL support and error states
 */

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      variant = 'default',
      disabled,
      rows = 4,
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
      'resize-none',
      
      // RTL support
      'text-right',
      
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

        {/* Textarea Field */}
        <textarea
          className={baseStyles}
          ref={ref}
          disabled={disabled}
          rows={rows}
          {...props}
        />

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

Textarea.displayName = 'Textarea';

export default Textarea;

