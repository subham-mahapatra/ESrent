import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { frontendServices, PaginatedResponse } from '@/lib/services/frontendServices';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseApiOptions {
  immediate?: boolean;
  dependencies?: any[];
  cacheKey?: string;
}

// Client-side only wrapper to prevent hydration issues
function useClientOnly() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

// Cache for storing API responses
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Debug: Track API calls
const apiCallCounts = new Map<string, number>();

// Helper function to generate stable cache keys
function generateCacheKey(endpoint: string, params?: any): string {
  if (!params) return endpoint;
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== null) {
        acc[key] = params[key];
      }
      return acc;
    }, {} as any);
  return `${endpoint}-${JSON.stringify(sortedParams)}`;
}

// Generic hook for API calls with caching
export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiState<T> & { refetch: () => Promise<void> } {
  const { immediate = true, dependencies = [], cacheKey } = options;
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Memoize the API call to prevent infinite re-renders
  const memoizedApiCall = useCallback(apiCall, dependencies);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!isMountedRef.current) return;

    // Debug: Track API calls
    if (cacheKey) {
      const count = (apiCallCounts.get(cacheKey) || 0) + 1;
      apiCallCounts.set(cacheKey, count);
      console.log(`API Call #${count} for ${cacheKey}`);
    }

    // Check cache first
    if (cacheKey && !forceRefresh) {
      const cached = apiCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`Cache hit for ${cacheKey}`);
        setState({ data: cached.data, loading: false, error: null });
        return;
      }
    }

    console.log(`Fetching data for ${cacheKey}`);
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await memoizedApiCall();
      
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        
        // Cache the result
        if (cacheKey) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          console.log(`Cached data for ${cacheKey}`);
        }
      }
    } catch (error) {
      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
      }
    }
  }, [memoizedApiCall, cacheKey]);

  useEffect(() => {
    if (immediate && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchData();
    }
  }, [fetchData, immediate]);

  // Timeout fallback: set loading to false after 10 seconds
  useEffect(() => {
    if (state.loading) {
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, loading: false, error: prev.error || 'Request timed out' }));
      }, 10000);
      return () => clearTimeout(timeout);
    }
  }, [state.loading]);

  return { ...state, refetch: () => fetchData(true) };
}

// Hook for cars
export function useCars(params?: {
  search?: string;
  brand?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  const cacheKey = useMemo(() => {
    return generateCacheKey('cars', params);
  }, [params]);

  const apiCall = useCallback(() => frontendServices.getCars(params), [params]);

  return useApi(apiCall, { 
    dependencies: [params],
    cacheKey 
  });
}

// Hook for a single car
export function useCar(id: string) {
  const apiCall = useCallback(() => frontendServices.getCar(id), [id]);

  return useApi(apiCall, { 
    dependencies: [id],
    cacheKey: `car-${id}`
  });
}

// Hook for brands
export function useBrands(params?: {
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const cacheKey = useMemo(() => {
    return generateCacheKey('brands', params);
  }, [params]);

  const apiCall = useCallback(() => frontendServices.getBrands(params), [params]);
  
  return useApi(apiCall, { 
    dependencies: [params],
    cacheKey 
  });
}

// Hook for a single brand
export function useBrand(id: string) {
  const apiCall = useCallback(() => frontendServices.getBrand(id), [id]);

  return useApi(apiCall, { 
    dependencies: [id],
    cacheKey: `brand-${id}`
  });
}

// Hook for categories
export function useCategories(params?: {
  search?: string;
  type?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const cacheKey = useMemo(() => {
    return generateCacheKey('categories', params);
  }, [params]);

  const apiCall = useCallback(() => frontendServices.getCategories(params), [params]);

  return useApi(apiCall, { 
    dependencies: [params],
    cacheKey 
  });
}

// Hook for a single category
export function useCategory(id: string) {
  const apiCall = useCallback(() => frontendServices.getCategory(id), [id]);

  return useApi(apiCall, { 
    dependencies: [id],
    cacheKey: `category-${id}`
  });
}

// Hook for authentication
export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const isClient = useClientOnly();

  useEffect(() => {
    // Only run on client side
    if (!isClient) return;

    // Check for token in localStorage
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      // Verify token
      frontendServices.verifyToken(storedToken)
        .then(({ valid, user }) => {
          if (valid && user) {
            setUser(user);
          } else {
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('authToken');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsInitialized(true);
        });
    } else {
      setIsInitialized(true);
    }
  }, [isClient]);

  const login = async (email: string, password: string) => {
    try {
      const { token: authToken, user: userData } = await frontendServices.login(email, password);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', authToken);
      }
      setToken(authToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const register = async (userData: { email: string; password: string; name: string; role: string }) => {
    try {
      const { user: newUser } = await frontendServices.register(userData);
      return { success: true, user: newUser };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    setToken(null);
    setUser(null);
  };

  return {
    token,
    user,
    isInitialized,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
  };
} 