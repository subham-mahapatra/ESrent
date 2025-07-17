'use client'
import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Car } from '@/types/car';
import { Category } from '@/types/category';
import { Button } from "@/components/ui/button";
import { FilterModal, FilterValues } from './FilterModal';
import { CarCard } from '@/components/car/CarCard';
import { motion } from "framer-motion";
import { EmptyCars } from '@/components/ui/empty-state';

interface FeaturedVehiclesProps {
  cars: Car[];
  categories: Category[];
}

export function FeaturedVehicles({ cars, categories }: FeaturedVehiclesProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const initialFilters: FilterValues = {
    types: [] as string[],
    tags: [] as string[],
    transmission: '',
    maxPrice: 10000,
  };

  // Filter out invalid cars before processing
  const validCars = cars.filter(car => 
    car && 
    car.id && 
    car.name && 
    car.brand && 
    car.model &&
    typeof car.dailyPrice === 'number' &&
    car.dailyPrice > 0
  );

  const [filteredCars, setFilteredCars] = useState<Car[]>(validCars);
  const [selectedFilters, setSelectedFilters] = useState(initialFilters);
  const [shouldResetFilters, setShouldResetFilters] = useState(false);

  // Build lookup maps
  const carTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.filter((c: any) => c.type === 'carType').forEach((c: any) => { if (c.id) map[c.id] = c.name; });
    return map;
  }, [categories]);
  const transmissionMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.filter((c: any) => c.type === 'transmission').forEach((c: any) => { if (c.id) map[c.id] = c.name; });
    return map;
  }, [categories]);
  const fuelTypeMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.filter((c: any) => c.type === 'fuelType').forEach((c: any) => { if (c.id) map[c.id] = c.name; });
    return map;
  }, [categories]);
  const tagMap = useMemo(() => {
    const map: Record<string, string> = {};
    categories.filter((c: any) => c.type === 'tag').forEach((c: any) => { if (c.id) map[c.id] = c.name; });
    return map;
  }, [categories]);

  const handleFiltersChange = (filters: FilterValues) => {
    setShouldResetFilters(false);
    setSelectedFilters(filters);
    const filtered = validCars.filter(car => {
      const matchesPrice = car.dailyPrice >= 1000 && car.dailyPrice <= filters.maxPrice;
      const matchesTransmission = !filters.transmission ||
        (Array.isArray(car.transmissionIds) && car.transmissionIds[0] && car.transmissionIds[0] === filters.transmission);
      const matchesType = filters.types.length === 0 ||
        (Array.isArray(car.carTypeIds) && car.carTypeIds[0] && filters.types.includes(car.carTypeIds[0]));
      // You may want to map IDs to names for a better UX
      return matchesPrice && matchesTransmission && matchesType;
    });
    setFilteredCars(filtered);
  };

  const clearFilters = () => {
    setShouldResetFilters(true);
    setSelectedFilters(initialFilters);
    setFilteredCars(validCars);
  };

  const hasActiveFilters = selectedFilters.types.length > 0 || 
    selectedFilters.tags.length > 0 || 
    selectedFilters.transmission !== '' || 
    selectedFilters.maxPrice < 10000;

  // Don't render if no valid cars
  if (validCars.length === 0) {
    return (
      <motion.section
        className="mt-8 px-4 sm:px-6 pb-8"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-heading-3">Featured Vehicles</h2>
          <Link href="/cars" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-white hover:bg-gray-100 hover:text-white/80 h-10 px-4 py-2">
            View All
          </Link>
        </div>
        <EmptyCars />
      </motion.section>
    );
  }

  return (
    <motion.section
      className="mt-8 px-4 sm:px-6 pb-8"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-heading-3">Featured Vehicles</h2>
        <div className="flex items-center gap-4">
          <FilterModal onFiltersChange={handleFiltersChange} shouldReset={shouldResetFilters} />
          <Link href="/cars" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-white hover:bg-gray-100 hover:text-white/80 h-10 px-4 py-2">
            View All
          </Link>
        </div>
      </div>
      
      {/* Selected Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {selectedFilters.types.map((type, index) => (
            <span
              key={`type-${index}-${type}`}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
          {selectedFilters.tags.map((tag, index) => (
            <span
              key={`tag-${index}-${tag}`}
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </span>
          ))}
          {selectedFilters.transmission && (
            <span
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              {selectedFilters.transmission.charAt(0).toUpperCase() + selectedFilters.transmission.slice(1)}
            </span>
          )}
          {selectedFilters.maxPrice < 10000 && (
            <span
              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
            >
              Up to ${selectedFilters.maxPrice.toLocaleString()}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground hover:text-primary"
          >
            Clear All
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCars.slice(0, 6).map((car) => (
          <CarCard
            key={car.id}
            car={car}
            carTypeNames={(car.carTypeIds || []).map((id) => carTypeMap[id]).filter(Boolean)}
            transmissionNames={(car.transmissionIds || []).map((id) => transmissionMap[id]).filter(Boolean)}
            fuelTypeNames={(car.fuelTypeIds || []).map((id) => fuelTypeMap[id]).filter(Boolean)}
            tagNames={(car.tagIds || []).map((id) => tagMap[id]).filter(Boolean)}
            onClick={() => {
              if (isClient && typeof window !== 'undefined') {
                localStorage.setItem('previousPage', 'home');
              }
            }}
          />
        ))}
      </div>
      
      {filteredCars.length === 0 && hasActiveFilters && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No vehicles match your current filters.</p>
          <Button
            variant="outline"
            onClick={clearFilters}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </motion.section>
  );
}
