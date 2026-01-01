'use client';

/**
 * Carousel Component
 * Simple carousel with navigation and auto-play
 */

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

export interface CarouselProps {
  children: ReactNode[];
  autoPlay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  className?: string;
}

export function Carousel({
  children,
  autoPlay = true,
  interval = 5000,
  showDots = true,
  showArrows = true,
  className,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const slideCount = children.length;

  const goToSlide = useCallback((index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % slideCount);
  }, [currentIndex, slideCount, goToSlide]);

  const goToPrevious = useCallback(() => {
    goToSlide((currentIndex - 1 + slideCount) % slideCount);
  }, [currentIndex, slideCount, goToSlide]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || slideCount <= 1) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, goToNext, slideCount]);

  if (slideCount === 0) return null;

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Slides */}
      <div className="relative h-full">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute inset-0"
          >
            {children[currentIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {showArrows && slideCount > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              'absolute left-4 top-1/2 -translate-y-1/2 z-10',
              'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm',
              'hover:bg-white dark:hover:bg-slate-800',
              'p-2 rounded-full shadow-lg',
              'transition-all duration-200',
              'opacity-0 hover:opacity-100 group-hover:opacity-100'
            )}
            aria-label="السابق"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>

          <button
            onClick={goToNext}
            className={cn(
              'absolute right-4 top-1/2 -translate-y-1/2 z-10',
              'bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm',
              'hover:bg-white dark:hover:bg-slate-800',
              'p-2 rounded-full shadow-lg',
              'transition-all duration-200',
              'opacity-0 hover:opacity-100 group-hover:opacity-100'
            )}
            aria-label="التالي"
          >
            <ChevronRight className="w-6 h-6 text-gray-800 dark:text-white" />
          </button>
        </>
      )}

      {/* Dots */}
      {showDots && slideCount > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {children.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`الانتقال إلى الشريحة ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

