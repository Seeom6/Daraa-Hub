'use client';

/**
 * ErrorMessage Component
 * 
 * Display error messages with retry option
 */

import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  variant?: 'inline' | 'card' | 'page';
}

export function ErrorMessage({
  title = 'حدث خطأ',
  message,
  onRetry,
  className,
  variant = 'inline',
}: ErrorMessageProps) {
  if (variant === 'page') {
    return (
      <div className={cn('flex items-center justify-center min-h-[400px]', className)}>
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>إعادة المحاولة</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={cn(
        'p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg',
        className
      )}>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300 mb-1">
              {title}
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400">
              {message}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className={cn('flex items-center gap-2 text-red-600 dark:text-red-400', className)}>
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm underline hover:no-underline"
        >
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;

