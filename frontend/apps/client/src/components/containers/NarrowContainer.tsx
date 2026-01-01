/**
 * Narrow Container Component
 * Narrow container for forms and focused content
 * Supports multiple sizes: sm, md, lg, xl
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';

interface NarrowContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'div' | 'section' | 'article';
}

const sizeClasses = {
  sm: 'max-w-sm',   // 384px (24rem)
  md: 'max-w-md',   // 448px (28rem)
  lg: 'max-w-lg',   // 512px (32rem)
  xl: 'max-w-xl',   // 576px (36rem)
};

export function NarrowContainer({ 
  children, 
  className,
  size = 'md',
  as: Component = 'div'
}: NarrowContainerProps) {
  return (
    <Component className={cn(
      sizeClasses[size],
      'mx-auto px-4',
      className
    )}>
      {children}
    </Component>
  );
}

