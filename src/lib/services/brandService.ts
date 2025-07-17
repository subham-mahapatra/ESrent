import { Brand, NewBrand, UpdateBrandData } from '@/types/brand';
import { Brand as BrandModel, Car as CarModel } from '@/lib/models';
import { dbConnect } from '@/lib/mongodb';

export interface BrandFilters {
  featured?: boolean;
  search?: string;
}

export interface BrandSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class BrandService {
  /**
   * Create a new brand
   */
  static async createBrand(brandData: NewBrand): Promise<Brand> {
    try {
      await dbConnect();
      const brand = new BrandModel(brandData);
      const savedBrand = await brand.save();
      return savedBrand.toJSON();
    } catch (error) {
      console.error('Error creating brand:', error);
      throw new Error('Failed to create brand');
    }
  }

  /**
   * Get a brand by ID
   */
  static async getBrandById(id: string): Promise<Brand | null> {
    try {
      await dbConnect();
      const brand = await BrandModel.findById(id);
      return brand ? brand.toJSON() : null;
    } catch (error) {
      console.error('Error getting brand by ID:', error);
      throw new Error('Failed to get brand');
    }
  }

  /**
   * Get a brand by slug
   */
  static async getBrandBySlug(slug: string): Promise<Brand | null> {
    try {
      await dbConnect();
      const brand = await BrandModel.findOne({ slug });
      return brand ? brand.toJSON() : null;
    } catch (error) {
      console.error('Error getting brand by slug:', error);
      throw new Error('Failed to get brand');
    }
  }

  /**
   * Get all brands with optional filtering and pagination
   */
  static async getAllBrands(
    filters: BrandFilters = {},
    options: BrandSearchOptions = {}
  ): Promise<{ brands: Brand[]; total: number; page: number; totalPages: number }> {
    try {
      await dbConnect();
      
      const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = options;
      const skip = (page - 1) * limit;

      // Build query
      const query: Record<string, unknown> = {};

      if (filters.featured !== undefined) {
        query.featured = filters.featured;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // Build sort object
      const sort: { [key: string]: 1 | -1 } = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [brands, total] = await Promise.all([
        BrandModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        BrandModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        brands: brands.map(brand => {
          const { _id, __v, ...rest } = brand as any;
          return {
            ...rest,
            id: _id.toString(),
          } as Brand;
        }),
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Error getting all brands:', error);
      throw new Error('Failed to get brands');
    }
  }

  /**
   * Update a brand
   */
  static async updateBrand(id: string, updateData: UpdateBrandData): Promise<Brand | null> {
    try {
      await dbConnect();
      const brand = await BrandModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      return brand ? brand.toJSON() : null;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw new Error('Failed to update brand');
    }
  }

  /**
   * Delete a brand
   */
  static async deleteBrand(id: string): Promise<boolean> {
    try {
      await dbConnect();
      const result = await BrandModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw new Error('Failed to delete brand');
    }
  }

  /**
   * Get featured brands
   */
  static async getFeaturedBrands(limit: number = 6): Promise<Brand[]> {
    try {
      await dbConnect();
      const brands = await BrandModel.find({ featured: true })
        .sort({ name: 1 })
        .limit(limit)
        .lean();

      return brands.map(brand => {
        const { _id, __v, ...rest } = brand as any;
        return {
          ...rest,
          id: _id.toString(),
        } as Brand;
      });
    } catch (error) {
      console.error('Error getting featured brands:', error);
      throw new Error('Failed to get featured brands');
    }
  }

  /**
   * Search brands
   */
  static async searchBrands(query: string, limit: number = 10): Promise<Brand[]> {
    try {
      await dbConnect();
      const brands = await BrandModel.find({
        $text: { $search: query }
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      return brands.map(brand => {
        const { _id, __v, ...rest } = brand as any;
        return {
          ...rest,
          id: _id.toString(),
        } as Brand;
      });
    } catch (error) {
      console.error('Error searching brands:', error);
      throw new Error('Failed to search brands');
    }
  }

  /**
   * Update car count for a brand
   */
  static async updateBrandCarCount(brandId: string): Promise<void> {
    try {
      await dbConnect();
      const carCount = await CarModel.countDocuments({ brand: brandId });
      await BrandModel.findByIdAndUpdate(brandId, { carCount });
    } catch (error) {
      console.error('Error updating brand car count:', error);
      throw new Error('Failed to update brand car count');
    }
  }

  /**
   * Update car counts for all brands
   */
  static async updateAllBrandCarCounts(): Promise<void> {
    try {
      await dbConnect();
      const brands = await BrandModel.find().lean();
      
      for (const brand of brands) {
        const carCount = await CarModel.countDocuments({ brand: brand.name });
        await BrandModel.findByIdAndUpdate(brand._id, { carCount });
      }
    } catch (error) {
      console.error('Error updating all brand car counts:', error);
      throw new Error('Failed to update brand car counts');
    }
  }

  /**
   * Get brand statistics
   */
  static async getBrandStats(): Promise<{
    total: number;
    featured: number;
    brandsWithCars: number;
  }> {
    try {
      await dbConnect();
      
      const [total, featured, brandsWithCars] = await Promise.all([
        BrandModel.countDocuments(),
        BrandModel.countDocuments({ featured: true }),
        BrandModel.countDocuments({ carCount: { $gt: 0 } })
      ]);

      return {
        total,
        featured,
        brandsWithCars
      };
    } catch (error) {
      console.error('Error getting brand stats:', error);
      throw new Error('Failed to get brand statistics');
    }
  }
} 