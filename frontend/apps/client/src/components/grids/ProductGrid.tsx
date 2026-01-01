/**
 * Product Grid Component
 * Responsive grid for displaying products
 * Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns, Large: 4 columns
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';

interface ProductGridProps {
  children: ReactNode;
  className?: string;
}

export function ProductGrid({ children, className }: ProductGridProps) {
  return (
    <div className={cn(
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
      className
    )}>
      {children}
    </div>
  );
}

