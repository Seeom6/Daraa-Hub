'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * NavigationProgress Component
 * Shows a loading bar at the top during navigation
 * 
 * How it works:
 * 1. Listens to clicks on <a> tags
 * 2. Starts loading immediately on click
 * 3. Finishes when pathname/searchParams change (page loaded)
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Function to handle link clicks
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && !link.href.startsWith('#')) {
        // Check if it's an internal link
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          // Start loading
          setIsLoading(true);
          setProgress(10);
        }
      }
    };

    // Add click listener to document
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Progress animation
  useEffect(() => {
    if (!isLoading) return;

    const timer1 = setTimeout(() => setProgress(30), 100);
    const timer2 = setTimeout(() => setProgress(50), 300);
    const timer3 = setTimeout(() => setProgress(70), 600);
    const timer4 = setTimeout(() => setProgress(85), 1000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isLoading]);

  // Finish loading when pathname changes
  useEffect(() => {
    if (isLoading) {
      setProgress(100);
      
      const timer = setTimeout(() => {
        setIsLoading(false);
        setProgress(0);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  if (!isLoading && progress === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent pointer-events-none"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-label="تحميل الصفحة"
    >
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 transition-all duration-300 ease-out shadow-lg shadow-blue-500/50"
        style={{
          width: `${progress}%`,
        }}
      >
        {/* Shimmer effect */}
        <div 
          className="absolute inset-0 opacity-50"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

