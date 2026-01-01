'use client';

/**
 * Checkbox Component
 * 
 * Reusable checkbox with RTL support
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, disabled, checked, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className={cn(
          'flex items-center gap-3 cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed'
        )}>
          {/* Hidden native checkbox */}
          <input
            type="checkbox"
            className="sr-only"
            ref={ref}
            disabled={disabled}
            checked={checked}
            {...props}
          />

          {/* Custom checkbox */}
          <div
            className={cn(
              'relative flex items-center justify-center',
              'w-5 h-5 rounded border-2 transition-all duration-200',
              
              // Default state
              'border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              
              // Checked state
              checked && [
                'bg-primary-500 border-primary-500',
                'dark:bg-primary-600 dark:border-primary-600',
              ],
              
              // Error state
              error && 'border-red-500 dark:border-red-500',
              
              // Hover state
              !disabled && 'hover:border-primary-500',
              
              className
            )}
          >
            {checked && (
              <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            )}
          </div>

          {/* Label */}
          {label && (
            <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
              {label}
            </span>
          )}
        </label>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-right">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;

