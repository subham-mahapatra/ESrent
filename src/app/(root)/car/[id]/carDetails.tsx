'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Car } from '@/types/car';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingState, ErrorState } from '@/components/ui/empty-state';
import { useCar } from '@/hooks/useApi';

export default function CarDetails() {
  const params = useParams();
  const router = useRouter();
  const carId = params.id as string;
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { data: car, loading, error } = useCar(carId);

  const handleBackClick = () => {
    if (!isClient) return;
    
    // Retrieve and clear previous page from localStorage
    const storedPreviousPage = localStorage.getItem('previousPage');
    localStorage.removeItem('previousPage');
    
    if (storedPreviousPage === 'brand') {
      router.back();
    } else {
      router.push('/cars');
    }
  };

  if (!isClient) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <ErrorState 
        error={error} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!car) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-semibold mb-4">Car Not Found</h1>
            <p className="text-muted-foreground mb-4">
              The car you're looking for doesn't exist.
            </p>
            <Button onClick={handleBackClick}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBackClick}
          className="mb-4"
        >
          ← Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-4">{car.name}</h1>
              {car.images && car.images.length > 0 && (
                <div className="mb-4">
                  <img
                    src={car.images[0]}
                    alt={car.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Brand</h3>
                  <p className="text-muted-foreground">{car.brand}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Model</h3>
                  <p className="text-muted-foreground">{car.model}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Year</h3>
                  <p className="text-muted-foreground">{car.year}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Daily Price</h3>
                  <p className="text-2xl font-bold text-green-600">${car.dailyPrice}</p>
                </div>
                {car.description && (
                  <div>
                    <h3 className="font-semibold text-lg">Description</h3>
                    <p className="text-muted-foreground">{car.description}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Car Specifications</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Transmission</span>
                  <p className="font-medium">{car.transmission || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Fuel Type</span>
                  <p className="font-medium">{car.fuel || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Category</span>
                  <p className="font-medium">{car.category || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Mileage</span>
                  <p className="font-medium">{car.mileage ? `${car.mileage} km` : 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-4">
            <Button 
              size="lg" 
              className="flex-1"
              onClick={() => {
                if (isClient && typeof window !== 'undefined') {
                  localStorage.setItem('previousPage', 'home');
                }
              }}
            >
              Rent Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                const message = `Hi, I'm interested in renting the ${car.brand} ${car.model}`;
                const whatsappNumber = "+971553553626";
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
              }}
            >
              Contact via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
