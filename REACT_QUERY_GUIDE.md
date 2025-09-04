# React Query (TanStack Query) Implementation Guide

This project now uses React Query (TanStack Query) for advanced data fetching, caching, and state management. This guide covers how to use the new hooks and features.

## 🚀 What's New

### Advanced Caching
- **Smart Stale Time**: Data is considered fresh for configurable periods
- **Garbage Collection**: Automatic cleanup of unused cached data
- **Background Updates**: Data refreshes automatically in the background

### Mutations with Optimistic Updates
- **Immediate UI Updates**: Changes appear instantly while API calls happen
- **Automatic Rollback**: Failed operations revert UI changes
- **Cache Invalidation**: Related data updates automatically

### Background Sync
- **Window Focus Refetching**: Data refreshes when user returns to tab
- **Network Reconnection**: Automatic retry when connection is restored
- **Manual Sync Controls**: Trigger updates on demand

## 📚 Available Hooks

### Query Hooks (Data Fetching)

#### `useCars(params?)`
```tsx
const { data, isLoading, error, refetch } = useCars({
  featured: true,
  limit: 10,
  brand: 'BMW'
});
```

#### `useCar(id)`
```tsx
const { data: car, isLoading, error } = useCar('car-123');
```

#### `useInfiniteCars(params?)`
```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteCars({ featured: true });
```

#### `useInfiniteCarsCursor(params?)` 🆕
```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
} = useInfiniteCarsCursor({ featured: true });
```

#### `useBrands(params?)`
```tsx
const { data: brands, isLoading } = useBrands({ featured: true });
```

#### `useCategories(params?)`
```tsx
const { data: categories, isLoading } = useCategories({ type: 'luxury' });
```

#### `useReviews(params?)`
```tsx
const { data: reviews, isLoading } = useReviews({ carId: 'car-123' });
```

### Mutation Hooks (Data Changes)

#### `useCreateReview()`
```tsx
const createReview = useCreateReview();

const handleSubmit = () => {
  createReview.mutate({
    carId: 'car-123',
    userName: 'John Doe',
    rating: 5,
    title: 'Great car!',
    comment: 'Excellent experience'
  });
};
```

#### `useUpdateReview()`
```tsx
const updateReview = useUpdateReview();

const handleUpdate = () => {
  updateReview.mutate({
    id: 'review-123',
    rating: 4,
    comment: 'Updated comment'
  });
};
```

#### `useDeleteReview()`
```tsx
const deleteReview = useDeleteReview();

const handleDelete = () => {
  deleteReview.mutate('review-123');
};
```

### Cursor-Based Pagination 🆕

Cursor-based pagination provides better performance and consistency compared to traditional offset-based pagination:

#### **Benefits:**
- **Consistent Performance**: No performance degradation with higher page numbers
- **Data Consistency**: No duplicate or missing items when data changes
- **Real-time Friendly**: Better for applications with frequent data updates
- **Efficient**: Optimized for large datasets

#### **Available Cursor Hooks:**
```tsx
// Cars with cursor pagination
const carsCursor = useInfiniteCarsCursor({ featured: true });

// Brands with cursor pagination
const brandsCursor = useInfiniteBrandsCursor({ featured: true });

// Categories with cursor pagination
const categoriesCursor = useInfiniteCategoriesCursor({ type: 'luxury' });

// Reviews with cursor pagination
const reviewsCursor = useInfiniteReviewsCursor({ carId: 'car-123' });
```

#### **Using with InfiniteScroll Component:**
```tsx
import { InfiniteScroll } from '@/components/ui/InfiniteScroll';

<InfiniteScroll
  data={carsCursor.data?.pages.flatMap(page => page.data) || []}
  fetchNextPage={carsCursor.fetchNextPage}
  hasNextPage={carsCursor.hasNextPage}
  isFetchingNextPage={carsCursor.isFetchingNextPage}
  isLoading={carsCursor.isLoading}
  isError={carsCursor.isError}
  error={carsCursor.error}
  renderItem={(car) => <CarCard car={car} />}
  autoLoad={true}
  manualLoadButton={false}
/>
```

### Utility Hooks

#### `useBackgroundSync()`
```tsx
const { syncAllData, syncCars, syncBrands } = useBackgroundSync();

// Sync all data
<Button onClick={syncAllData}>Refresh All</Button>

// Sync specific data
<Button onClick={syncCars}>Refresh Cars</Button>
```

#### `usePrefetchCar(id)` / `usePrefetchBrand(id)`
```tsx
const prefetchCar = usePrefetchCar('car-123');

// Preload data for better UX
<Link onMouseEnter={prefetchCar}>View Car</Link>
```

#### `useOptimisticUpdate(queryKey, updateFn)`
```tsx
const optimisticUpdate = useOptimisticUpdate(
  queryKeys.cars.detail('car-123'),
  (oldData) => ({ ...oldData, name: 'Updated Name' })
);

const handleUpdate = () => {
  const rollback = optimisticUpdate(() => {
    // API call here
    updateCarAPI();
  });
  
  // Rollback if needed
  setTimeout(rollback, 5000);
};
```

## ⚙️ Configuration

### Query Client Settings
The React Query client is configured with these defaults:

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes
      retry: 3,                         // Retry failed requests 3 times
      retryDelay: exponentialBackoff,   // Exponential backoff
      refetchOnWindowFocus: true,       // Refetch when tab becomes active
      refetchOnReconnect: true,         // Refetch when network reconnects
      refetchOnMount: true,             // Refetch when component mounts
    },
    mutations: {
      retry: 1,                         // Retry failed mutations once
      retryDelay: 1000,                 // 1 second delay
    },
  },
});
```

### Stale Time Configuration
Different data types have different stale times:

- **Cars**: 5 minutes (frequently changing)
- **Brands**: 10 minutes (stable data)
- **Categories**: 10 minutes (stable data)
- **Reviews**: 2 minutes (user-generated content)

## 🔄 Cache Management

### Automatic Invalidation
Mutations automatically invalidate related queries:

```tsx
// When creating a review, these queries are invalidated:
queryClient.invalidateQueries({ queryKey: queryKeys.reviews.byCar(carId) });
queryClient.invalidateQueries({ queryKey: queryKeys.reviews.stats(carId) });
queryClient.invalidateQueries({ queryKey: queryKeys.cars.detail(carId) });
```

### Manual Cache Control
```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

// Remove specific query from cache
queryClient.removeQueries({ queryKey: queryKeys.cars.detail('car-123') });

// Clear all cars cache
queryClient.removeQueries({ queryKey: queryKeys.cars.all });

// Set data manually
queryClient.setQueryData(queryKeys.cars.detail('car-123'), newCarData);
```

## 📱 Background Updates

### Window Focus Refetching
Data automatically refreshes when the user returns to the tab, ensuring they always see fresh information.

### Network Reconnection
When a user's device reconnects to the internet, React Query automatically retries failed requests and refreshes stale data.

### Background Sync
Use the sync hooks to manually trigger updates:

```tsx
const { syncAllData } = useBackgroundSync();

// Refresh all data in background
useEffect(() => {
  const interval = setInterval(syncAllData, 5 * 60 * 1000); // Every 5 minutes
  return () => clearInterval(interval);
}, []);
```

## 🎯 Best Practices

### 1. Use Appropriate Stale Times
- **Frequently changing data**: 1-5 minutes
- **Stable reference data**: 10-30 minutes
- **User-generated content**: 1-2 minutes

### 2. Leverage Optimistic Updates
```tsx
// Good: Update UI immediately
const updateCar = useUpdateCar();
updateCar.mutate(data, {
  onSuccess: () => console.log('Success'),
  onError: () => console.log('Error - UI will rollback')
});

// Bad: Wait for API response
const [isUpdating, setIsUpdating] = useState(false);
setIsUpdating(true);
await updateCarAPI();
setIsUpdating(false);
```

### 3. Use Infinite Queries for Pagination
```tsx
const {
  data,
  fetchNextPage,
  hasNextPage
} = useInfiniteCars({ limit: 12 });

// Load more data
{hasNextPage && (
  <Button onClick={() => fetchNextPage()}>
    Load More
  </Button>
)}
```

### 4. Prefetch Data for Better UX
```tsx
const prefetchCar = usePrefetchCar('car-123');

// Preload data when user hovers over link
<Link onMouseEnter={prefetchCar}>View Car</Link>
```

## 🐛 Debugging

### React Query DevTools
In development mode, you'll see a floating button in the bottom-right corner. Click it to open the DevTools panel showing:

- All active queries
- Cache state
- Query status
- Performance metrics

### Query Keys
Use consistent query keys for better debugging:

```tsx
// Good: Structured keys
queryKeys.cars.detail('car-123')
queryKeys.reviews.byCar('car-123')

// Bad: Inconsistent keys
['car', 'car-123']
['reviews', 'car-123']
```

## 🔄 Migration from Old Hooks

### Before (useApi)
```tsx
const { data, loading, error, refetch } = useApi(
  () => frontendServices.getCars(),
  { cacheKey: 'cars' }
);
```

### After (React Query)
```tsx
const { data, isLoading, error, refetch } = useCars();
```

### Benefits
- ✅ Automatic caching
- ✅ Background updates
- ✅ Better error handling
- ✅ Optimistic updates
- ✅ Infinite queries
- ✅ Prefetching
- ✅ DevTools

## 🎯 **InfiniteScroll Component**

The `InfiniteScroll` component provides a reusable way to implement infinite scrolling with React Query:

```tsx
import { InfiniteScroll } from '@/components/ui/InfiniteScroll';

// Auto-load on scroll
<InfiniteScroll
  data={data}
  fetchNextPage={fetchNextPage}
  hasNextPage={hasNextPage}
  isFetchingNextPage={isFetchingNextPage}
  isLoading={isLoading}
  isError={isError}
  error={error}
  renderItem={(item) => <ItemComponent item={item} />}
  autoLoad={true}
  manualLoadButton={false}
/>

// Manual load button
<InfiniteScroll
  data={data}
  fetchNextPage={fetchNextPage}
  hasNextPage={hasNextPage}
  isFetchingNextPage={isFetchingNextPage}
  isLoading={isLoading}
  isError={isError}
  error={error}
  renderItem={(item) => <ItemComponent item={item} />}
  autoLoad={false}
  manualLoadButton={true}
/>
```

#### **Component Props:**
- `data`: Array of items to display
- `fetchNextPage`: Function to load next page
- `hasNextPage`: Boolean indicating if more data is available
- `isFetchingNextPage`: Boolean for loading state
- `isLoading`: Boolean for initial loading state
- `isError`: Boolean for error state
- `error`: Error object if any
- `renderItem`: Function to render each item
- `autoLoad`: Enable automatic loading on scroll
- `manualLoadButton`: Show manual load more button
- `threshold`: Intersection observer threshold (default: 0.1)
- `rootMargin`: Intersection observer root margin (default: "100px")

## 📖 Examples

See `src/components/demo/ReactQueryDemo.tsx` for a comprehensive example of all features.

## 🚀 Performance Tips

1. **Use `enabled` option** for conditional queries
2. **Implement prefetching** for critical user paths
3. **Leverage optimistic updates** for better perceived performance
4. **Use appropriate stale times** to balance freshness and performance
5. **Implement infinite queries** for large datasets

## 🔗 Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [React Query Examples](https://tanstack.com/query/latest/docs/react/examples/react/simple)
- [Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)
