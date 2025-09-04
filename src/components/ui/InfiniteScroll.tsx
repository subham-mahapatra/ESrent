"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from './button';
import { Loader2 } from 'lucide-react';

interface InfiniteScrollProps<T> {
  data: T[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderError?: (error: Error) => React.ReactNode;
  renderLoading?: () => React.ReactNode;
  className?: string;
  itemClassName?: string;
  threshold?: number;
  rootMargin?: string;
  autoLoad?: boolean;
  manualLoadButton?: boolean;
}

export function InfiniteScroll<T>({
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  isError,
  error,
  renderItem,
  renderEmpty,
  renderError,
  renderLoading,
  className = "",
  itemClassName = "",
  threshold = 0.1,
  rootMargin = "100px",
  autoLoad = true,
  manualLoadButton = false,
}: InfiniteScrollProps<T>) {
  const { ref, inView } = useInView({
    threshold,
    rootMargin,
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Auto-load when scrolling to the bottom
  useEffect(() => {
    if (autoLoad && inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage, autoLoad]);

  // Manual load more function
  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Render loading state
  if (isLoading) {
    return renderLoading ? (
      renderLoading()
    ) : (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  // Render error state
  if (isError && error) {
    return renderError ? (
      renderError(error)
    ) : (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return renderEmpty ? (
      renderEmpty()
    ) : (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No items found</h3>
        <p className="text-gray-600">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Items list */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Load more trigger (for auto-load) */}
      {autoLoad && hasNextPage && (
        <div ref={ref} className="h-4" />
      )}

      {/* Manual load more button */}
      {manualLoadButton && hasNextPage && (
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleLoadMore}
            disabled={isFetchingNextPage}
            variant="outline"
            className="min-w-[120px]"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {/* Loading indicator for next page */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-gray-600">Loading more...</span>
        </div>
      )}

      {/* End of results indicator */}
      {!hasNextPage && data.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          <div className="w-16 h-px bg-gray-300 mx-auto mb-2" />
          <span className="text-sm">End of results</span>
        </div>
      )}
    </div>
  );
}
