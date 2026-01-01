/**
 * Main Container Component
 * Standard container for most pages (max-w-7xl)
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';

interface MainContainerProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function MainContainer({ 
  children, 
  className,
  as: Component = 'div'
}: MainContainerProps) {
  return (
    <Component className={cn(
      'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </Component>
  );
}

