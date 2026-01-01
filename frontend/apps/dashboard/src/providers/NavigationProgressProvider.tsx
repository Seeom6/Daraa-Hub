'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface NavigationProgressContextType {
  isNavigating: boolean;
  startNavigation: () => void;
  finishNavigation: () => void;
}

const NavigationProgressContext = createContext<NavigationProgressContextType>({
  isNavigating: false,
  startNavigation: () => {},
  finishNavigation: () => {},
});

export function useNavigationProgress() {
  return useContext(NavigationProgressContext);
}

export function NavigationProgressProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  const finishNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  // Auto-finish navigation when pathname or searchParams change
  useEffect(() => {
    finishNavigation();
  }, [pathname, searchParams, finishNavigation]);

  return (
    <NavigationProgressContext.Provider
      value={{
        isNavigating,
        startNavigation,
        finishNavigation,
      }}
    >
      {children}
    </NavigationProgressContext.Provider>
  );
}

