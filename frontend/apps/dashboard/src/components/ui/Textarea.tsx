/**
 * Textarea Component
 * Reusable textarea with validation states
 */

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  fullWidth?: boolean;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      error,
      fullWidth = false,
      resize = 'vertical',
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'input-field';
    const errorStyles = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : '';
    const widthStyles = fullWidth ? 'w-full' : '';
    const resizeStyles = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className={cn('relative', widthStyles)}>
        <textarea
          ref={ref}
          className={cn(
            baseStyles,
            errorStyles,
            resizeStyles[resize],
            widthStyles,
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

