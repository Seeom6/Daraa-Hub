'use client';

/**
 * Spinner Component
 * 
 * Loading spinner with different sizes
 */

import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: 'primary' | 'white' | 'gray';
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

const colorClasses = {
  primary: 'border-primary-500 border-t-transparent',
  white: 'border-white border-t-transparent',
  gray: 'border-gray-300 border-t-transparent dark:border-gray-600',
};

export function Spinner({ size = 'md', className, color = 'primary' }: SpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block rounded-full animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
      aria-label="جاري التحميل"
    >
      <span className="sr-only">جاري التحميل...</span>
    </div>
  );
}

export default Spinner;

