/**
 * Select Component
 * Reusable select dropdown with validation states
 */

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      options = [],
      error,
      fullWidth = false,
      placeholder,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'input-field appearance-none cursor-pointer';
    const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={cn('relative', widthStyles)}>
        <select
          ref={ref}
          className={cn(
            baseStyles,
            errorStyles,
            widthStyles,
            'pl-10',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown className="w-5 h-5" />
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

