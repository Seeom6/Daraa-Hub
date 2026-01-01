/**
 * FormField Component
 * Wrapper for form inputs with label and error handling
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  required?: boolean;
  hint?: string;
  fullWidth?: boolean;
}

export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      children,
      label,
      error,
      required = false,
      hint,
      fullWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-2', fullWidth && 'w-full', className)}
        {...props}
      >
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        
        {children}
        
        {hint && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
        
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

