export interface Category {
  id?: string;
  name: string;
  slug: string;
  type: 'carType' | 'fuelType' | 'tag';
  image?: string;
  description?: string;
  carCount?: number;
  featured?: boolean;
  
  // MongoDB specific fields
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for creating a new category
export interface CreateCategoryData extends Omit<Category, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

// Type for updating a category
export interface UpdateCategoryData extends Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>> {}
