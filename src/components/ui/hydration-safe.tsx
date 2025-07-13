'use client';

import { useEffect, useState } from 'react';

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationSafe({ children, fallback = null }: HydrationSafeProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook to check if component is hydrated
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
} 