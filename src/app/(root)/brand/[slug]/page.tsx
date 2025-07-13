'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Brand } from '@/types/brand';
import { Car } from '@/types/car';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CarCard } from '@/components/car/CarCard';
import { EmptyCars } from '@/components/ui/empty-state';
import { LoadingState, ErrorState } from '@/components/ui/empty-state';
import { useBrand, useCars } from '@/hooks/useApi';

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: brandData, loading: brandLoading, error: brandError } = useBrand(slug);
  const { data: carsData, loading: carsLoading, error: carsError } = useCars({ brand: slug });

  const brand = brandData;
  const cars = carsData?.data || [];

  if (!isClient) {
    return <LoadingState />;
  }

  if (brandError || carsError) {
    return (
      <ErrorState 
        error={brandError || carsError || 'Failed to load brand data'} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (brandLoading || carsLoading) {
    return <LoadingState />;
  }

  if (!brand) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-semibold mb-4">Brand Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The brand you're looking for doesn't exist.
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {brand.logo && (
              <img
                src={brand.logo}
                alt={brand.name}
                className="w-16 h-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold">{brand.name}</h1>
              {brand.description && (
                <p className="text-muted-foreground mt-2">{brand.description}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Cars by {brand.name}</h2>
        {cars.length === 0 ? (
          <EmptyCars />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <CarCard 
                key={car.id} 
                car={car} 
                onClick={() => {
                  if (isClient && typeof window !== 'undefined') {
                    localStorage.setItem('previousPage', 'brand');
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
