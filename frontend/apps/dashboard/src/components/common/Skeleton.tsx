/**
 * Skeleton Component
 * Loading placeholder with animation
 */

import { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-slate-700';

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  if (count > 1) {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={cn(baseStyles, variants[variant], className)}
            style={style}
            {...props}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      style={style}
      {...props}
    />
  );
}

// Skeleton Card
export function SkeletonCard() {
  return (
    <div className="glass-medium p-6 rounded-2xl space-y-4">
      <Skeleton variant="rectangular" height={200} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </div>
    </div>
  );
}

// Skeleton Table
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </div>
        </div>
      ))}
    </div>
  );
}

