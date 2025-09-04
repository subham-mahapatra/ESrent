import React from 'react';
import Link from 'next/link';
import { Card } from './card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  subtitle?: string;
  tips?: string[];
}

export function EmptyState({ 
  title, 
  description, 
  icon, 
  action, 
  className = "",
  subtitle,
  tips
}: EmptyStateProps) {
  return (
    <Card className={`p-8 sm:p-10 text-center bg-gradient-to-b from-muted/30 to-muted/10 ${className}`}>
      {icon && (
        <div className="mx-auto mb-5 flex items-center justify-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 text-primary flex items-center justify-center">
            <div className="h-7 w-7 opacity-80">
              {icon}
            </div>
          </div>
        </div>
      )}
      <h3 className="text-xl sm:text-2xl font-semibold tracking-tight mb-2">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-muted-foreground mb-1">{subtitle}</p>
      )}
      <p className="text-muted-foreground max-w-2xl mx-auto mb-5">
        {description}
      </p>
      {Array.isArray(tips) && tips.length > 0 && (
        <ul className="max-w-xl mx-auto text-left space-y-2 mb-6 list-disc list-inside text-muted-foreground/90">
          {tips.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      )}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </Card>
  );
}

// Predefined empty states for common scenarios
export function EmptyCars() {
  return (
    <EmptyState
      title="No cars found"
      description="We couldn't find any cars matching your criteria. Try adjusting your filters or explore our full catalog."
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      }
      tips={[
        'Clear some filters or broaden your search keywords.',
        'Try increasing the price range to include more options.',
        'Browse our complete collection to discover alternatives.'
      ]}
      action={
        <Link href="/cars">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Browse all cars
          </Button>
        </Link>
      }
    />
  );
}

export function EmptyBrands() {
  return (
    <EmptyState
      title="No brands found"
      description="We couldn't find any car brands. You can explore popular brands from our catalog."
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      }
      action={
        <Link href="/brands">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Explore brands
          </Button>
        </Link>
      }
    />
  );
}

export function EmptyCategories() {
  return (
    <EmptyState
      title="No categories found"
      description="We couldn't find any car categories. Browse all categories to get started."
      icon={
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      }
      action={
        <Link href="/categories">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Browse categories
          </Button>
        </Link>
      }
    />
  );
}

export function LoadingState() {
  return (
    <Card className="p-8 sm:p-10 text-center bg-gradient-to-b from-muted/30 to-muted/10">
      <div className="mx-auto h-12 w-12 text-primary mb-4">
        <svg className="animate-spin w-full h-full" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Loading...
      </h3>
      <p className="text-muted-foreground">
        Please wait while we fetch the data.
      </p>
    </Card>
  );
}

export function ErrorState({ 
  error, 
  onRetry 
}: { 
  error: string; 
  onRetry?: () => void; 
}) {
  return (
    <Card className="p-8 sm:p-10 text-center bg-gradient-to-b from-red-500/10 to-muted/10">
      <div className="mx-auto h-12 w-12 text-red-400 mb-4">
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2">
        Something went wrong
      </h3>
      <p className="text-muted-foreground mb-4">
        {error}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="bg-primary text-primary-foreground hover:bg-primary/90">
          Try again
        </Button>
      )}
    </Card>
  );
} 