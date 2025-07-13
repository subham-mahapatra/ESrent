'use client'

import { Suspense, useEffect, useState, Component, ReactNode, useMemo } from "react"
import { Car } from "@/types/car"
import { Brand } from "@/types/brand"
import { Category } from "@/types/category"
import { Header } from "./components/Header"
import { SearchBar } from "./components/SearchBar"

import { FeaturedBrands } from "./components/FeaturedBrands"
import { Categories } from "./components/Categories"
import { FeaturedVehicles } from "./components/FeaturedVehicles"
import { CardSkeleton, CategoryCardSkeleton } from '@/components/ui/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';
import TestimonialsSection from "./components/TestimonialsSection";
import { FaWhatsapp } from "react-icons/fa";
import { NotSureSection } from "./components/NotSureSection";
import { HeroSection } from "./components/HeroSection";
import DemoOne from '@/components/ui/demo';
import { LoadingState, ErrorState, EmptyCars, EmptyBrands, EmptyCategories } from '@/components/ui/empty-state';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center p-4">
          <p className="heading-4 text-red-500">Something went wrong:</p>
          <pre className="body-2">{this.state.error?.message}</pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function LoadingSpinner() {
  return (
    <div className="grid gap-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-xl" />
        ))}
      </div>
      <CategoryCardSkeleton />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// Import API hooks
import { useCars, useBrands, useCategories } from '@/hooks/useApi';

function FeaturedContent() {
  // Memoize the API parameters to prevent unnecessary re-renders
  const carsParams = useMemo(() => ({ featured: true, limit: 6 }), []);
  const brandsParams = useMemo(() => ({ featured: true, limit: 10 }), []);
  const categoriesParams = useMemo(() => ({ limit: 10 }), []);

  // Use API hooks for data fetching with caching
  const { 
    data: carsData, 
    loading: carsLoading, 
    error: carsError,
    refetch: refetchCars 
  } = useCars(carsParams);
  
  const { 
    data: brandsData, 
    loading: brandsLoading, 
    error: brandsError,
    refetch: refetchBrands 
  } = useBrands(brandsParams);
  
  const { 
    data: categoriesData, 
    loading: categoriesLoading, 
    error: categoriesError,
    refetch: refetchCategories 
  } = useCategories(categoriesParams);

  // Memoize the extracted data to prevent unnecessary re-renders
  const cars = useMemo(() => carsData?.data || [], [carsData]);
  const brands = useMemo(() => brandsData?.data || [], [brandsData]);
  const categories = useMemo(() => categoriesData?.data || [], [categoriesData]);

  // Check for loading state
  const loading = carsLoading || brandsLoading || categoriesLoading;

  // Check for errors
  const errors = [carsError, brandsError, categoriesError].filter(Boolean);
  const hasErrors = errors.length > 0;

  // Filter out any invalid data
  const validCars = useMemo(() => 
    cars.filter(car => car && car.id && car.name), 
    [cars]
  );
  const validBrands = useMemo(() => 
    brands.filter(brand => brand && brand.id && brand.name && brand.logo), 
    [brands]
  );
  const validCategories = useMemo(() => 
    categories.filter(category => category && category.name), 
    [categories]
  );

  // Handle retry for all data
  const handleRetry = () => {
    refetchCars();
    refetchBrands();
    refetchCategories();
  };

  if (hasErrors) {
    return (
      <ErrorState 
        error={errors.join(', ')} 
        onRetry={handleRetry}
      />
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <>
      {validBrands.length > 0 ? (
        <FeaturedBrands brands={validBrands} />
      ) : (
        <div className="mt-8 px-4 sm:px-6 pb-8">
          <EmptyBrands />
        </div>
      )}
      
      {validCars.length > 0 ? (
        <FeaturedVehicles cars={validCars} />
      ) : (
        <div className="mt-8 px-4 sm:px-6 pb-8">
          <EmptyCars />
        </div>
      )}
      
      <DemoOne />
      
      {validCategories.length > 0 ? (
        <Categories categories={validCategories} />
      ) : (
        <div className="mt-8 px-4 sm:px-6 pb-8">
          <EmptyCategories />
        </div>
      )}
      
      <TestimonialsSection />
    </>
  );
}

function WhatsAppFAB() {
      const whatsappNumber = "+971553553626"; // Replace with your actual WhatsApp number
  const message = "Hi, I'm interested in renting a car"; // Default message
  
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-12 right-12 sm:right-12 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 ease-in-out z-50"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="w-6 h-6" />
    </button>
  );
}

export default function HomeScreen() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <Header />
      <div className="relative z-0">
        <HeroSection />
        <main className="flex-1 max-w-7xl mx-auto w-full p-4">
          <ErrorBoundary>
            <Suspense fallback={<LoadingState />}>
              <FeaturedContent />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <WhatsAppFAB />
    </div>
  );
}
