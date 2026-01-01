'use client';

/**
 * Select Component
 * 
 * Reusable select dropdown with RTL support
 */

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'filled' | 'outlined';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      placeholder,
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
      'focus:outline-none focus:ring-2',
      'appearance-none cursor-pointer',
      
      // RTL support
      'text-right pr-12',
      
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

        {/* Select Container */}
        <div className="relative">
          {/* Select Field */}
          <select
            className={baseStyles}
            ref={ref}
            disabled={disabled}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown className="w-5 h-5" />
          </div>
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

Select.displayName = 'Select';

export default Select;

