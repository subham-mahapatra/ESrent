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
    isMountedRef.current = true;
    hasInitializedRef.current = false; // Ensure fresh fetch on every mount
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
    console.log('fetchData: set loading true');
    
    try {
      console.log('fetchData: calling memoizedApiCall');
      const data = await memoizedApiCall();
      console.log('fetchData: API call resolved', data);
      
      if (isMountedRef.current) {
        setState({ data, loading: false, error: null });
        console.log('fetchData: set state with data', data);
        
        // Cache the result
        if (cacheKey) {
          apiCache.set(cacheKey, { data, timestamp: Date.now() });
          console.log(`Cached data for ${cacheKey}`);
        }
      } else {
        console.log('fetchData: not mounted, skipping setState');
      }
    } catch (error) {
      console.error('fetchData: API error', error);
      if (isMountedRef.current) {
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        });
        console.log('fetchData: set state with error', error);
      } else {
        console.log('fetchData: not mounted, skipping setState (error)');
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
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, loading: false, error: prev.error || 'Request timed out' }));
        }
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
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);
  const cacheKey = useMemo(() => {
    return generateCacheKey('cars', stableParams);
  }, [stableParams]);

  const apiCall = useCallback(() => frontendServices.getCars(stableParams), [stableParams]);

  return useApi(apiCall, { 
    dependencies: [stableParams],
    cacheKey 
  });
}

// Hook for a single car
export function useCar(id: string) {
  const stableId = useMemo(() => id, [id]);
  const apiCall = useCallback(() => frontendServices.getCar(stableId), [stableId]);

  return useApi(apiCall, { 
    dependencies: [stableId],
    cacheKey: `car-${stableId}`
  });
}

// Hook for brands
export function useBrands(params?: {
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);
  const cacheKey = useMemo(() => {
    return generateCacheKey('brands', stableParams);
  }, [stableParams]);

  const apiCall = useCallback(() => frontendServices.getBrands(stableParams), [stableParams]);
  
  return useApi(apiCall, { 
    dependencies: [stableParams],
    cacheKey 
  });
}

// Hook for a single brand
export function useBrand(id: string) {
  const stableId = useMemo(() => id, [id]);
  const apiCall = useCallback(() => frontendServices.getBrand(stableId), [stableId]);

  return useApi(apiCall, { 
    dependencies: [stableId],
    cacheKey: `brand-${stableId}`
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
  const stableParams = useMemo(() => params, [JSON.stringify(params)]);
  const cacheKey = useMemo(() => {
    return generateCacheKey('categories', stableParams);
  }, [stableParams]);

  const apiCall = useCallback(() => frontendServices.getCategories(stableParams), [stableParams]);

  return useApi(apiCall, { 
    dependencies: [stableParams],
    cacheKey 
  });
}

// Hook for a single category
export function useCategory(id: string) {
  const stableId = useMemo(() => id, [id]);
  const apiCall = useCallback(() => frontendServices.getCategory(stableId), [stableId]);

  return useApi(apiCall, { 
    dependencies: [stableId],
    cacheKey: `category-${stableId}`
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
    console.log('Auth Hook: token in localStorage:', storedToken);
    if (storedToken) {
      setToken(storedToken);
      // Verify token
      frontendServices.verifyToken(storedToken)
        .then(({ valid, user }) => {
          console.log('Auth Hook: /api/auth/verify response:', { valid, user });
          if (valid && user) {
            setUser(user);
          } else {
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
          }
        })
        .catch((err) => {
          console.error('Auth Hook: /api/auth/verify error:', err);
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