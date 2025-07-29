

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
  originalPrice: number;
  discountedPrice?: number;
  images: string[];
  description?: string;
  keywords?: string[];
  features?: string[];
  category?: string;
  categoryId?: string;
  available?: boolean;
  featured?: boolean;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
  carTypeIds?: string[];
  transmissionIds?: string[];
  fuelTypeIds?: string[];
  tagIds?: string[];
  fuelType?: string;
  type?: string;
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
  carTypeIds?: string[];
  transmissionIds?: string[];
  fuelTypeIds?: string[];
  tagIds?: string[];
}

// Type for updating a car
export interface UpdateCarData extends Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>> {
  brandId?: string;
  engine?: string;
  power?: string;
  tags?: string[];
  seater?: number;
  carTypeIds?: string[];
  transmissionIds?: string[];
  fuelTypeIds?: string[];
  tagIds?: string[];
}
