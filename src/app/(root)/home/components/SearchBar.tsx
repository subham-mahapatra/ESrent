'use client'

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Car } from "@/types/car";

// Extended Car type for Algolia search results
interface AlgoliaCarResult extends Car {
  objectID?: string;
}
import Link from 'next/link';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { useRouter } from 'next/navigation';

const formatPrice = (dailyPrice: number | undefined | null) => {
  if (!dailyPrice && dailyPrice !== 0) return 'Price on request';
  return dailyPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'AED'
  }) + '/day';
};

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  // If value/onChange are provided, use them (controlled); otherwise, use internal state
  const [internalValue, setInternalValue] = useState('');
  const inputValue = value !== undefined ? value : internalValue;
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    } else {
      setInternalValue(e.target.value);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // This logic is no longer needed as the dropdown is removed
      // if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      //   setShowDropdown(false);
      // }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCars = async () => {
      const trimmedQuery = inputValue.trim();
      
      if (!trimmedQuery) {
        // setResults([]); // No longer needed
        // setIsLoading(false); // No longer needed
        return;
      }

      // Check cache first
      // if (searchCache.current[trimmedQuery]) { // No longer needed
      //   setResults(searchCache.current[trimmedQuery]);
      //   setIsLoading(false);
      //   return;
      // }

      // setIsLoading(true); // No longer needed
      try {
        // Get initial results from Algolia
        const searchResults: AlgoliaCarResult[] = []; // or mock data
        
        // Removed Firestore data fetching, use Algolia or mock data only
        const enhancedResults = await Promise.all(
          (searchResults as AlgoliaCarResult[]).map(async (car) => {
            try {
              // Use objectID from Algolia result, fallback to id
              // const carId = car.objectID || car.id;
              // const carDoc = await getDoc(doc(db, 'cars', carId)); // Original line commented out
              // if (carDoc.exists()) { // Original line commented out
              //   // Merge Firestore data with Algolia data, prioritizing Firestore // Original line commented out
              //   return { // Original line commented out
              //     ...car, // Original line commented out
              //     ...carDoc.data(), // Original line commented out
              //     id: carId, // Original line commented out
              //     objectID: car.objectID, // Original line commented out
              //     dailyPrice: carDoc.data().dailyPrice ?? car.dailyPrice, // Original line commented out
              //     images: carDoc.data().images ?? car.images // Original line commented out
              //   } as AlgoliaCarResult; // Original line commented out
              // } // Original line commented out
              return car;
            } catch (error) {
              console.error(`Error fetching Firestore data for car ${car.objectID || car.id}:`, error);
              return car;
            }
          })
        );

        // Cache the enhanced results
        // searchCache.current[trimmedQuery] = enhancedResults; // No longer needed
        // setResults(enhancedResults); // No longer needed
        // setShowDropdown(true); // No longer needed
      } catch (error) {
        console.error('Search error:', error);
        // setResults([]); // No longer needed
      } finally {
        // setIsLoading(false); // No longer needed
      }
    };

    searchCars();
  }, [inputValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      // router.push(`/search/results?q=${encodeURIComponent(query.trim())}`); // No longer needed
    }
  };

  return (
    <div className="px-4 sm:px-6 pt-6 sm:pt-8 max-w-7xl mx-auto w-full">
      <form className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={placeholder || "Search luxury vehicles"}
          className="pl-10 pr-4 h-10 md:h-12 bg-secondary/50 hover:bg-secondary/70 transition-colors rounded-full"
          value={inputValue}
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
