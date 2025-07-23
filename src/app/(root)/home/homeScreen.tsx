'use client'

import { Suspense, Component, ReactNode, useMemo } from "react"


import { FeaturedBrands } from "./components/FeaturedBrands"
import { Categories } from "./components/Categories"
import { FeaturedVehicles } from "./components/FeaturedVehicles"
import TestimonialsSection from "./components/TestimonialsSection";
import { FaWhatsapp } from "react-icons/fa";
import { HeroSection } from "./components/HeroSection";
import DemoOne from '@/components/ui/demo';
import { ErrorState, EmptyCars, EmptyBrands, EmptyCategories } from '@/components/ui/empty-state';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from "./components/Header"
import { Brand } from '@/types/brand';
import { Car } from '@/types/car';
import { Category } from '@/types/category';

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



// Import API hooks
import { useCars, useBrands, useCategories } from '@/hooks/useApi';

function FeaturedContent() {
  // Memoize the API parameters to prevent unnecessary re-renders
  const carsParams = useMemo(() => ({ limit: 1000 }), []); // fetch all cars (featured and non-featured)
  const brandsParams = useMemo(() => ({ featured: true, limit: 10 }), []);
  const categoriesParams = useMemo(() => ({}), []);

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
  const validBrands = useMemo(() => {
    const seen = new Set();
    return brands.filter(brand => {
      if (!brand || !brand.id || !brand.name || !brand.logo) return false;
      if (seen.has(brand.id)) return false;
      seen.add(brand.id);
      return true;
    });
  }, [brands]);
  const validCategories = useMemo(() => 
    categories.filter(category => category && category.name), 
    [categories]
  );
  console.log("validCategories",validCategories)

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
    return (
      <div className="space-y-12">
        {/* Featured Brands Skeleton */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="w-40 h-24 flex-shrink-0 flex items-center justify-center bg-gray-800/60 border-gray-700">
                <Skeleton className="w-16 h-16 rounded-full bg-gray-700" />
              </Card>
            ))}
          </div>
        </div>
        {/* Featured Vehicles Skeleton */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 bg-gray-800/60 border-gray-700 flex flex-col">
              <Skeleton className="h-40 w-full rounded-t-xl bg-gray-700" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4 bg-gray-700" />
                <Skeleton className="h-4 w-1/2 bg-gray-700" />
                <Skeleton className="h-4 w-1/3 bg-gray-700" />
              </div>
            </Card>
          ))}
        </div>
        {/* Categories Skeleton */}
        <div className="mb-8">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="w-32 h-16 flex-shrink-0 flex items-center justify-center bg-gray-800/60 border-gray-700">
                <Skeleton className="w-20 h-6 bg-gray-700" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {validBrands.length > 0 ? (
        <FeaturedBrands brands={validBrands as unknown as Brand[]} />
      ) : (
        <div className="mt-8 px-4 sm:px-6 pb-8">
          <EmptyBrands />
        </div>
      )}
      
      {validCars.length > 0 ? (
        <FeaturedVehicles cars={validCars as unknown as Car[]} categories={validCategories as unknown as Category[]} />
      ) : (
        <div className="mt-8 px-4 sm:px-6 pb-8">
          <EmptyCars />
        </div>
      )}
      
      <DemoOne />
      
      {validCategories.length > 0 ? (
        <Categories categories={validCategories as unknown as Category[]} />
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
            <Suspense fallback={
              <div className="space-y-12">
                {/* Featured Brands Skeleton */}
                <div className="mb-8">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {[...Array(6)].map((_, i) => (
                      <Card key={i} className="w-40 h-24 flex-shrink-0 flex items-center justify-center bg-gray-800/60 border-gray-700">
                        <Skeleton className="w-16 h-16 rounded-full bg-gray-700" />
                      </Card>
                    ))}
                  </div>
                </div>
                {/* Featured Vehicles Skeleton */}
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="h-64 bg-gray-800/60 border-gray-700 flex flex-col">
                      <Skeleton className="h-40 w-full rounded-t-xl bg-gray-700" />
                      <div className="p-4 space-y-2">
                        <Skeleton className="h-6 w-3/4 bg-gray-700" />
                        <Skeleton className="h-4 w-1/2 bg-gray-700" />
                        <Skeleton className="h-4 w-1/3 bg-gray-700" />
                      </div>
                    </Card>
                  ))}
                </div>
                {/* Categories Skeleton */}
                <div className="mb-8">
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {[...Array(8)].map((_, i) => (
                      <Card key={i} className="w-32 h-16 flex-shrink-0 flex items-center justify-center bg-gray-800/60 border-gray-700">
                        <Skeleton className="w-20 h-6 bg-gray-700" />
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            }>
              <FeaturedContent />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <WhatsAppFAB />
    </div>
  );
}
