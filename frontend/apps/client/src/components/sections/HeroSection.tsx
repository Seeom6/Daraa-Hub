/**
 * Hero Section Component
 * Main hero section for landing pages
 * Supports text + image layout
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';
import { MainContainer } from '../containers';

interface HeroSectionProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  actions?: ReactNode;
  image?: ReactNode;
  className?: string;
  minHeight?: string;
  imagePosition?: 'left' | 'right';
}

export function HeroSection({
  title,
  description,
  actions,
  image,
  className,
  minHeight = 'min-h-[600px]',
  imagePosition = 'right',
}: HeroSectionProps) {
  return (
    <section className={cn('relative flex items-center', minHeight, className)}>
      <MainContainer className="w-full">
        <div className={cn(
          'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center',
          imagePosition === 'left' && 'lg:grid-flow-dense'
        )}>
          {/* Text Content */}
          <div className={cn(
            'space-y-6',
            imagePosition === 'left' && 'lg:col-start-2'
          )}>
            {typeof title === 'string' ? (
              <h1 className="text-gray-900 dark:text-gray-100">{title}</h1>
            ) : (
              title
            )}

            {description && (
              typeof description === 'string' ? (
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  {description}
                </p>
              ) : (
                description
              )
            )}

            {actions && (
              <div className="flex flex-wrap gap-4">
                {actions}
              </div>
            )}
          </div>

          {/* Image */}
          {image && (
            <div className={cn(
              'relative',
              imagePosition === 'left' && 'lg:col-start-1 lg:row-start-1'
            )}>
              {image}
            </div>
          )}
        </div>
      </MainContainer>
    </section>
  );
}

