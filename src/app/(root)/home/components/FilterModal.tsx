'use client'

import { useCallback, useReducer, memo, useRef, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Category } from '@/types/category';

interface FilterModalProps {
  onFiltersChange: (filters: FilterValues) => void;
  shouldReset?: boolean;
  categories: Category[];
}

export interface FilterValues {
  maxPrice: number;
  transmission?: string;
  types: string[];
  tags: string[];
}

interface FilterState extends FilterValues {
  open: boolean;
}

type FilterAction = 
  | { type: 'SET_MAX_PRICE'; payload: number }
  | { type: 'SET_TRANSMISSION'; payload: string }
  | { type: 'SET_TYPES'; payload: string[] }
  | { type: 'SET_TAGS'; payload: string[] }
  | { type: 'RESET' }
  | { type: 'SET_OPEN'; payload: boolean };

const initialState: FilterState = {
  open: false,
  maxPrice: 15000,
  transmission: "",
  types: [],
  tags: [],
};

function filterReducer(state: FilterState, action: FilterAction): FilterState {
  switch (action.type) {
    case 'SET_MAX_PRICE':
      return { ...state, maxPrice: action.payload };
    case 'SET_TRANSMISSION':
      return { ...state, transmission: action.payload };
    case 'SET_TYPES':
      return { ...state, types: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'RESET':
      return { ...initialState, open: state.open };
    case 'SET_OPEN':
      return { ...state, open: action.payload };
    default:
      return state;
  }
}

function useDebounce<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

const FilterModalComponent = memo(({ onFiltersChange, shouldReset, categories }: FilterModalProps) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  useEffect(() => {
    if (shouldReset) {
      dispatch({ type: 'RESET' });
    }
  }, [shouldReset]);

  // Dynamic options from categories
  const carTypes = (categories ?? []).filter(c => c.type === 'carType');
  const carTags = (categories ?? []).filter(c => c.type === 'tag');

  const debouncedPriceChange = useDebounce<[number]>((value: number) => {
    dispatch({ type: 'SET_MAX_PRICE', payload: value });
  }, 300);

  const handlePriceChange = useCallback((value: number[]) => {
    debouncedPriceChange(value[0]);
  }, [debouncedPriceChange]);

  const handleTypesChange = useCallback((value: string[]) => {
    dispatch({ type: 'SET_TYPES', payload: value });
  }, []);

  const handleTagsChange = useCallback((value: string[]) => {
    dispatch({ type: 'SET_TAGS', payload: value });
  }, []);

  const handleApplyFilters = useCallback(() => {
    const { maxPrice, types, tags } = state;
    onFiltersChange({ maxPrice, types, tags });
    dispatch({ type: 'SET_OPEN', payload: false });
  }, [state, onFiltersChange]);

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);


  return (
    <Dialog open={state.open} onOpenChange={(open) => dispatch({ type: 'SET_OPEN', payload: open })}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
         <span className='hidden md:inline'> Filters</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Filter Vehicles</DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label className="text-base font-semibold">Maximum Price (AED)</Label>
            <Slider
              defaultValue={[state.maxPrice]}
              min={1000}
              max={15000}
              step={500}
              onValueChange={handlePriceChange}
              className="w-full [&_[role=slider]]:bg-indigo-600 [&_[role=track]]:bg-indigo-100"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>AED 1,000</span>
              <span>AED {state.maxPrice}</span>
            </div>
          </div>

          <hr className="my-2 border-t border-gray-200" />

          <div className="space-y-2">
            <Label className="text-base font-semibold">Car Types</Label>
            <div className="grid grid-cols-2 gap-2">
              {carTypes.map((type, index) => (
                <Button
                  key={`cartype-${index}-${type.id}`}
                  variant={state.types.includes(type.name.toLowerCase()) ? "default" : "outline"}
                  onClick={() => {
                    const newTypes = state.types.includes(type.name.toLowerCase())
                      ? state.types.filter((t) => t !== type.name.toLowerCase())
                      : [...state.types, type.name.toLowerCase()];
                    handleTypesChange(newTypes);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors
                    ${state.types.includes(type.name.toLowerCase())
                      ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                      : 'border border-gray-300 bg-white text-gray-800 hover:bg-indigo-100 hover:text-indigo-700'}
                  `}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>

          <hr className="my-2 border-t border-gray-200" />

          <div className="space-y-2">
            <Label className="text-base font-semibold">Features</Label>
            <div className="grid grid-cols-3 gap-2">
              {carTags.map((tag, index) => (
                <Button
                  key={`tag-${index}-${tag.id}`}
                  variant={state.tags.includes(tag.name.toLowerCase()) ? "default" : "outline"}
                  onClick={() => {
                    const newTags = state.tags.includes(tag.name.toLowerCase())
                      ? state.tags.filter((t) => t !== tag.name.toLowerCase())
                      : [...state.tags, tag.name.toLowerCase()];
                    handleTagsChange(newTags);
                  }}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors
                    ${state.tags.includes(tag.name.toLowerCase())
                      ? 'bg-indigo-600 text-white shadow hover:bg-indigo-700'
                      : 'border border-gray-300 bg-white text-gray-800 hover:bg-indigo-100 hover:text-indigo-700'}
                  `}
                >
                  {tag.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            onClick={handleApplyFilters}
            className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition-colors"
          >
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

FilterModalComponent.displayName = 'FilterModal';
export const FilterModal = FilterModalComponent;
