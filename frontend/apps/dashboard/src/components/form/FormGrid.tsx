/**
 * FormGrid Component
 * Grid layout for form fields
 */

import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface FormGridProps extends HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
}

export const FormGrid = forwardRef<HTMLDivElement, FormGridProps>(
  (
    {
      children,
      columns = 2,
      gap = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const columnStyles = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    const gapStyles = {
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          columnStyles[columns],
          gapStyles[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormGrid.displayName = 'FormGrid';

