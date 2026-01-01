'use client';

/**
 * FormField Component
 * 
 * Wrapper component for form fields with consistent styling
 */

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  children: ReactNode;
  className?: string;
}

export function FormField({ children, className }: FormFieldProps) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export default FormField;

