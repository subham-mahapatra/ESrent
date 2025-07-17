'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Car } from '@/types/car';
import { SearchResultsSkeleton } from '@/components/ui/card-skeleton';
import { PageHeader } from '@/components/PageHeader';
import { ErrorState } from '@/components/ui/error-state';
import { CarCard } from '@/components/car/CarCard';
import { frontendServices } from '@/lib/services/frontendServices';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params?.id as string;
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>('');

  const loadCarsByCategory = useCallback(async () => {
    try {
      setLoading(true);
      const decodedId = decodeURIComponent(categoryId);
      
      // First, try to find the category by ID
      const categoriesResponse = await frontendServices.getCategoriesWithCarCounts();
      let category = categoriesResponse.categories.find(cat => cat.id === decodedId);
      
      if (!category) {
        // If not found by ID, try by name (fallback)
        category = categoriesResponse.categories.find(cat => 
          (cat as any).name.toLowerCase() === decodedId.toLowerCase()
        );
      }
      
      if (category) {
        setCategoryName((category as any).name);
        // Use categoryId to fetch cars
        const response = await frontendServices.getCars({ 
          categoryId: (category as any).id,
          limit: 50 // Get more cars for category pages
        });
        setCars((response.data as unknown as Car[]) || []);
      } else {
        // Fallback to category name if ID not found
        setCategoryName(decodedId);
        const response = await frontendServices.getCars({ 
          category: decodedId,
          limit: 50
        });
        setCars((response.data as unknown as Car[]) || []);
      }
    } catch (error) {
      console.error('Error loading cars:', error);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    loadCarsByCategory();
  }, [categoryId, loadCarsByCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Loading..." />
        <div className="container mx-auto px-4 py-8">
          <SearchResultsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={categoryName ? `${categoryName} Cars` : 'Loading...'} />
      <div className="container mx-auto px-4 py-8">
        {cars.length > 0 ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-semibold mb-2">{categoryName} Cars</h2>
              <p className="text-muted-foreground">Found {cars.length} cars in this category</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                />
              ))}
            </div>
          </>
        ) : (
          <ErrorState 
            title="No Cars Found"
            message={`We couldn't find any cars of type '${categoryName}'. Please try another type or return to home.`}
            showHomeButton={true}
          />
        )}
      </div>
    </div>
  );
}
