import { Category, CreateCategoryData, UpdateCategoryData } from '@/types/category';
import { Category as CategoryModel, Car as CarModel } from '@/lib/models';
import { dbConnect } from '@/lib/mongodb';

export interface CategoryFilters {
  type?: 'carType' | 'fuelType' | 'tag';
  featured?: boolean;
  search?: string;
}

export interface CategorySearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CategoryService {
  /**
   * Create a new category
   */
  static async createCategory(categoryData: CreateCategoryData): Promise<Category> {
    try {
      await dbConnect();
      const category = new CategoryModel(categoryData);
      const savedCategory = await category.save();
      return savedCategory.toJSON();
    } catch (error) {
      console.error('Error creating category:', error);
      throw new Error('Failed to create category');
    }
  }

  /**
   * Get a category by ID
   */
  static async getCategoryById(id: string): Promise<Category | null> {
    try {
      await dbConnect();
      const category = await CategoryModel.findById(id);
      return category ? category.toJSON() : null;
    } catch (error) {
      console.error('Error getting category by ID:', error);
      throw new Error('Failed to get category');
    }
  }

  /**
   * Get a category by slug
   */
  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      await dbConnect();
      const category = await CategoryModel.findOne({ slug });
      return category ? category.toJSON() : null;
    } catch (error) {
      console.error('Error getting category by slug:', error);
      throw new Error('Failed to get category');
    }
  }

  /**
   * Get all categories with optional filtering and pagination
   */
  static async getAllCategories(
    filters: CategoryFilters = {},
    options: CategorySearchOptions = {}
  ): Promise<{ categories: Category[]; total: number; page: number; totalPages: number }> {
    try {
      await dbConnect();
      
      const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc' } = options;
      const skip = (page - 1) * limit;

      // Build query
      const query: Record<string, unknown> = {};

      if (filters.type) {
        query.type = filters.type;
      }

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
      const [categories, total] = await Promise.all([
        CategoryModel.find(query)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        CategoryModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        categories: categories.map(category => {
          const { _id, __v, ...rest } = category as any;
          return {
            ...rest,
            id: _id.toString(),
          } as Category;
        }),
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  /**
   * Update a category
   */
  static async updateCategory(id: string, updateData: UpdateCategoryData): Promise<Category | null> {
    try {
      await dbConnect();
      const category = await CategoryModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      return category ? category.toJSON() : null;
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  /**
   * Delete a category
   */
  static async deleteCategory(id: string): Promise<boolean> {
    try {
      await dbConnect();
      const result = await CategoryModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  /**
   * Get categories by type
   */
  static async getCategoriesByType(type: 'carType' | 'fuelType' | 'tag'): Promise<Category[]> {
    try {
      await dbConnect();
      const categories = await CategoryModel.find({ type })
        .sort({ name: 1 })
        .lean();

      return categories.map(category => {
        const { _id, __v, ...rest } = category as any;
        return {
          ...rest,
          id: _id.toString(),
        } as Category;
      });
    } catch (error) {
      console.error('Error getting categories by type:', error);
      throw new Error('Failed to get categories by type');
    }
  }

  /**
   * Get featured categories
   */
  static async getFeaturedCategories(limit: number = 6): Promise<Category[]> {
    try {
      await dbConnect();
      const categories = await CategoryModel.find({ featured: true })
        .sort({ name: 1 })
        .limit(limit)
        .lean();

      return categories.map(category => {
        const { _id, __v, ...rest } = category as any;
        return {
          ...rest,
          id: _id.toString(),
        } as Category;
      });
    } catch (error) {
      console.error('Error getting featured categories:', error);
      throw new Error('Failed to get featured categories');
    }
  }

  /**
   * Search categories
   */
  static async searchCategories(query: string, limit: number = 10): Promise<Category[]> {
    try {
      await dbConnect();
      const categories = await CategoryModel.find({
        $text: { $search: query }
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      return categories.map(category => {
        const { _id, __v, ...rest } = category as any;
        return {
          ...rest,
          id: _id.toString(),
        } as Category;
      });
    } catch (error) {
      console.error('Error searching categories:', error);
      throw new Error('Failed to search categories');
    }
  }

  /**
   * Update car count for a category
   */
  static async updateCategoryCarCount(categoryId: string): Promise<void> {
    try {
      await dbConnect();
      const category = await CategoryModel.findById(categoryId);
      if (!category) return;

      const carCount = await CarModel.countDocuments({ category: category.name });
      await CategoryModel.findByIdAndUpdate(categoryId, { carCount });
    } catch (error) {
      console.error('Error updating category car count:', error);
      throw new Error('Failed to update category car count');
    }
  }

  /**
   * Update car counts for all categories
   */
  static async updateAllCategoryCarCounts(): Promise<void> {
    try {
      await dbConnect();
      const categories = await CategoryModel.find().lean();
      
      for (const category of categories) {
        const carCount = await CarModel.countDocuments({ category: category.name });
        await CategoryModel.findByIdAndUpdate(category._id, { carCount });
      }
    } catch (error) {
      console.error('Error updating all category car counts:', error);
      throw new Error('Failed to update category car counts');
    }
  }

  /**
   * Get category statistics
   */
  static async getCategoryStats(): Promise<{
    total: number;
    featured: number;
    byType: {
      carType: number;
      fuelType: number;
      tag: number;
    };
    categoriesWithCars: number;
  }> {
    try {
      await dbConnect();
      
      const [total, featured, carType, fuelType, tag, categoriesWithCars] = await Promise.all([
        CategoryModel.countDocuments(),
        CategoryModel.countDocuments({ featured: true }),
        CategoryModel.countDocuments({ type: 'carType' }),
        CategoryModel.countDocuments({ type: 'fuelType' }),
        CategoryModel.countDocuments({ type: 'tag' }),
        CategoryModel.countDocuments({ carCount: { $gt: 0 } })
      ]);

      return {
        total,
        featured,
        byType: {
          carType,
          fuelType,
          tag
        },
        categoriesWithCars
      };
    } catch (error) {
      console.error('Error getting category stats:', error);
      throw new Error('Failed to get category statistics');
    }
  }

  /**
   * Get all categories with car counts
   */
  static async getAllCategoriesWithCarCounts(): Promise<Category[]> {
    try {
      await dbConnect();
      
      // Get all categories
      const categories = await CategoryModel.find()
        .sort({ type: 1, name: 1 })
        .lean();

      // Get car counts for each category
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          let carCount = 0;
          
          // Count cars based on category type
          switch (category.type) {
            case 'carType':
              // Count cars where categoryId matches or category name matches
              carCount = await CarModel.countDocuments({
                $or: [
                  { categoryId: category._id },
                  { category: { $regex: category.name, $options: 'i' } }
                ],
                isAvailable: true 
              });
              break;
            case 'fuelType':
              // Count cars where fuel type matches the category name
              carCount = await CarModel.countDocuments({ 
                fuel: { $regex: category.name, $options: 'i' },
                isAvailable: true 
              });
              break;
            case 'tag':
              // Count cars where tags include the category name
              carCount = await CarModel.countDocuments({ 
                tags: { $regex: category.name, $options: 'i' },
                isAvailable: true 
              });
              break;
          }

          const { _id, __v, ...rest } = category as any;
          return {
            ...rest,
            id: _id.toString(),
            _id: undefined,
            __v: undefined,
            carCount
          } as Category;
        })
      );

      return categoriesWithCounts;
    } catch (error) {
      console.error('Error getting categories with car counts:', error);
      throw new Error('Failed to get categories with car counts');
    }
  }
} 