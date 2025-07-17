export interface Brand {
  id: string;
  name: string;
  logo: string;
  slug: string;
  featured?: boolean;
  carCount?: number;
  
  // MongoDB specific fields
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NewBrand extends Omit<Brand, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

// Type for updating a brand
export interface UpdateBrandData extends Partial<Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>> {}
