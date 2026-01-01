/**
 * Input Component
 * Reusable input field with icons and validation states
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'input-field';
    const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const widthStyles = fullWidth ? 'w-full' : '';

    return (
      <div className={cn('relative', widthStyles)}>
        {leftIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            baseStyles,
            errorStyles,
            leftIcon && 'pr-10',
            rightIcon && 'pl-10',
            widthStyles,
            className
          )}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
        
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

