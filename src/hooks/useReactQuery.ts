'use client';

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { frontendServices } from '@/lib/services/frontendServices';
import { toast } from '@/components/hooks/use-toast';

// Query Keys for consistent caching
export const queryKeys = {
  cars: {
    all: ['cars'] as const,
    lists: () => [...queryKeys.cars.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.cars.lists(), params] as const,
    details: () => [...queryKeys.cars.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.cars.details(), id] as const,
    search: (params?: Record<string, unknown>) => [...queryKeys.cars.all, 'search', params] as const,
    cursor: (params?: Record<string, unknown>) => [...queryKeys.cars.all, 'cursor', params] as const,
  },
  brands: {
    all: ['brands'] as const,
    lists: () => [...queryKeys.brands.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.brands.lists(), params] as const,
    details: () => [...queryKeys.brands.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.brands.all, 'detail', id] as const,
    cursor: (params?: Record<string, unknown>) => [...queryKeys.brands.all, 'cursor', params] as const,
  },
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.categories.lists(), params] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.all, 'detail', id] as const,
    cursor: (params?: Record<string, unknown>) => [...queryKeys.categories.all, 'cursor', params] as const,
  },
  reviews: {
    all: ['reviews'] as const,
    lists: () => [...queryKeys.reviews.all, 'list'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.reviews.lists(), params] as const,
    details: () => [...queryKeys.reviews.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.reviews.all, 'detail', id] as const,
    byCar: (carId: string) => [...queryKeys.reviews.all, 'car', carId] as const,
    stats: (carId: string) => [...queryKeys.reviews.all, 'stats', carId] as const,
    cursor: (params?: Record<string, unknown>) => [...queryKeys.reviews.all, 'cursor', params] as const,
  },
  users: {
    all: ['users'] as const,
    profile: () => [...queryKeys.users.all, 'profile'] as const,
  },
} as const;

// Car Hooks
export function useCars(params?: {
  search?: string;
  brand?: string;
  brandId?: string;
  category?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  featured?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.cars.list(params),
    queryFn: () => frontendServices.getCars(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

export function useCar(id: string) {
  return useQuery({
    queryKey: queryKeys.cars.detail(id),
    queryFn: () => frontendServices.getCar(id),
    staleTime: 10 * 60 * 1000, // 10 minutes for individual cars
    gcTime: 15 * 60 * 1000, // 15 minutes
    enabled: !!id,
  });
}

export function useInfiniteCars(params?: {
  search?: string;
  brand?: string;
  brandId?: string;
  category?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.cars.search(params),
    queryFn: ({ pageParam = 1 }) => 
      frontendServices.getCars({ ...params, page: pageParam, limit: 12 }),
    getNextPageParam: (lastPage, allPages) => {
      // If we have less items than the limit, we've reached the end
      if (lastPage.data.length < 12) return undefined;
      return allPages.length + 1;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Cursor-based infinite query for cars
export function useInfiniteCarsCursor(params?: {
  search?: string;
  brand?: string;
  brandId?: string;
  category?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.cars.cursor(params),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => 
      frontendServices.getCarsCursor({ ...params, cursor: pageParam, limit: 12 }),
    getNextPageParam: (lastPage) => {
      // Return the next cursor if available
      return lastPage.hasNext ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Brand Hooks
export function useBrands(params?: {
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.brands.list(params),
    queryFn: () => frontendServices.getBrands(params),
    staleTime: 10 * 60 * 1000, // 10 minutes for brands
    gcTime: 15 * 60 * 1000,
  });
}

export function useBrand(id: string) {
  return useQuery({
    queryKey: queryKeys.brands.detail(id),
    queryFn: () => frontendServices.getBrand(id),
    staleTime: 15 * 60 * 1000, // 15 minutes for individual brands
    gcTime: 20 * 60 * 1000,
    enabled: !!id,
  });
}

// Cursor-based infinite query for brands
export function useInfiniteBrandsCursor(params?: {
  search?: string;
  featured?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.brands.cursor(params),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => 
      frontendServices.getBrandsCursor({ ...params, cursor: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Category Hooks
export function useCategories(params?: {
  search?: string;
  type?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.categories.list(params),
    queryFn: () => frontendServices.getCategories(params),
    staleTime: 10 * 60 * 1000, // 10 minutes for categories
    gcTime: 15 * 60 * 1000,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: queryKeys.categories.detail(id),
    queryFn: () => frontendServices.getCategory(id),
    staleTime: 15 * 60 * 1000, // 15 minutes for individual categories
    gcTime: 20 * 60 * 1000,
    enabled: !!id,
  });
}

// Cursor-based infinite query for categories
export function useInfiniteCategoriesCursor(params?: {
  search?: string;
  type?: string;
  featured?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.categories.cursor(params),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => 
      frontendServices.getCategoriesCursor({ ...params, cursor: pageParam, limit: 20 }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Review Hooks
export function useReviews(params?: {
  carId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: queryKeys.reviews.list(params),
    queryFn: () => frontendServices.getReviews(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for reviews (more dynamic)
    gcTime: 5 * 60 * 1000,
  });
}

export function useReviewsByCar(carId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.byCar(carId),
    queryFn: () => frontendServices.getReviews({ carId }),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: !!carId,
  });
}

export function useReviewStats(carId: string) {
  return useQuery({
    queryKey: queryKeys.reviews.stats(carId),
    queryFn: () => frontendServices.getReviewStats(carId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!carId,
  });
}

// Cursor-based infinite query for reviews
export function useInfiniteReviewsCursor(params?: {
  carId?: string;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.reviews.cursor(params),
    queryFn: ({ pageParam }: { pageParam: string | undefined }) => 
      frontendServices.getReviewsCursor({ ...params, cursor: pageParam, limit: 10 }),
    getNextPageParam: (lastPage) => {
      return lastPage.hasNext ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined as string | undefined,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

// Mutation Hooks
export function useCreateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: {
      carId: string;
      userName: string;
      userEmail?: string;
      rating: number;
      title: string;
      comment: string;
    }) => frontendServices.createReview(data),
    onSuccess: (data, variables) => {
      // Optimistically update the reviews list
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byCar(variables.carId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.stats(variables.carId) });
      
      // Update the car's rating in the cache
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(variables.carId) });
      
      toast({
        title: "Review submitted successfully!",
        description: "Thank you for your feedback.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit review",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string; rating: number; comment: string }) =>
      frontendServices.updateReview(data.id, data),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      
      toast({
        title: "Review updated successfully!",
        description: "Your review has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update review",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteReview() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => frontendServices.deleteReview(id),
    onSuccess: (data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all });
      
      toast({
        title: "Review deleted successfully!",
        description: "Your review has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to delete review",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// Car Mutations
export function useUpdateCar() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { id: string; updates: Record<string, unknown> }) =>
      frontendServices.updateCar(data.id, data.updates),
    onSuccess: (data, variables) => {
      // Update the car in cache
      queryClient.setQueryData(
        queryKeys.cars.detail(variables.id),
        data
      );
      
      // Invalidate cars list to refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.cars.lists() });
      
      toast({
        title: "Car updated successfully!",
        description: "The car information has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to update car",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });
}

// Background Sync Hook
export function useBackgroundSync() {
  const queryClient = useQueryClient();
  
  const syncAllData = () => {
    // Refetch all active queries in the background
    queryClient.refetchQueries({ type: 'active' });
  };
  
  const syncCars = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.cars.all });
  };
  
  const syncBrands = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.brands.all });
  };
  
  const syncCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  };
  
  return {
    syncAllData,
    syncCars,
    syncBrands,
    syncCategories,
  };
}

// Prefetching Hooks for better UX
export function usePrefetchCar(id: string) {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.cars.detail(id),
      queryFn: () => frontendServices.getCar(id),
      staleTime: 10 * 60 * 1000,
    });
  };
}

export function usePrefetchBrand(id: string) {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.brands.detail(id),
      queryFn: () => frontendServices.getBrand(id),
      staleTime: 15 * 60 * 1000,
    });
  };
}

// Utility hook for optimistic updates
export function useOptimisticUpdate<T>(
  queryKey: readonly unknown[],
  updateFn: (oldData: T | undefined) => T
) {
  const queryClient = useQueryClient();
  
  return (updater: () => void) => {
    // Store the current data
    const previousData = queryClient.getQueryData<T>(queryKey);
    
    // Optimistically update the cache
    queryClient.setQueryData(queryKey, updateFn(previousData));
    
    // Execute the actual update
    updater();
    
    // Return a function to rollback if needed
    return () => {
      queryClient.setQueryData(queryKey, previousData);
    };
  };
}
