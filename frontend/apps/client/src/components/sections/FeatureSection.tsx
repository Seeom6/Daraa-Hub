/**
 * Feature Section Component
 * Section for displaying features in a grid
 */

import { ReactNode } from 'react';
import { cn } from '@daraa/utils';
import { MainContainer } from '../containers';

interface Feature {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureSectionProps {
  features: Feature[];
  title?: string;
  description?: string;
  columns?: 2 | 3 | 4;
  className?: string;
  background?: 'default' | 'white' | 'gray';
}

const columnClasses = {
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
};

const backgroundClasses = {
  default: '',
  white: 'bg-white dark:bg-slate-900',
  gray: 'bg-gray-50 dark:bg-slate-950',
};

export function FeatureSection({
  features,
  title,
  description,
  columns = 3,
  className,
  background = 'white',
}: FeatureSectionProps) {
  return (
    <section className={cn(
      'py-16',
      backgroundClasses[background],
      className
    )}>
      <MainContainer>
        {/* Header */}
        {(title || description) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="mb-4 text-gray-900 dark:text-gray-100">{title}</h2>
            )}
            {description && (
              <p className="text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className={cn(
          'grid gap-8',
          columnClasses[columns]
        )}>
          {features.map((feature) => (
            <div 
              key={feature.id} 
              className="text-center space-y-4"
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                <div className="text-blue-500">
                  {feature.icon}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </MainContainer>
    </section>
  );
}

