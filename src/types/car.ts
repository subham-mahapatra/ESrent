

export interface Car {
  id: string;
  brand: string;
  brandId?: string;
  model: string;
  name: string;
  year: number;
  transmission: string;
  fuel: string;
  mileage: number;
  dailyPrice: number;
  images: string[];
  description?: string;
  features?: string[];
  category?: string;
  categoryId?: string;
  isAvailable?: boolean;
  isFeatured?: boolean;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
  
  // Legacy fields for backward compatibility
  fuelType?: string; // Some cars might use this instead of 'fuel'
  type?: string; // Some cars might use this instead of 'category'
  available?: boolean; // Some cars might use this instead of 'isAvailable'
  featured?: boolean; // Some cars might use this instead of 'isFeatured'
  
  // MongoDB specific fields
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for creating a new car (without id and timestamps)
export interface CreateCarData extends Omit<Car, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
  brandId?: string;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
}

// Type for updating a car
export interface UpdateCarData extends Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>> {
  brandId?: string;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
}
