import { Car, CreateCarData, UpdateCarData } from '@/types/car';
import { Car as CarModel } from '@/lib/models';
import { dbConnect } from '@/lib/mongodb';
import type { ICar } from '@/lib/models/carSchema';
import { Model } from 'mongoose';

export interface CarFilters {
  brand?: string;
  category?: string;
  categoryId?: string;
  transmission?: string;
  fuel?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  isFeatured?: boolean;
  search?: string;
  brandId?: string;
}

export interface CarSearchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class CarService {
  /**
   * Create a new car
   */
  static async createCar(carData: CreateCarData): Promise<Car> {
    try {
      await dbConnect();
      const car = new CarModel(carData);
      const savedCar = await car.save();
      const carObj = savedCar.toJSON();
      (carObj as any).id = carObj._id?.toString();
      if ('_id' in carObj) delete (carObj as any)._id;
      if ('__v' in carObj) delete (carObj as any).__v;
      return carObj as unknown as Car;
    } catch (error) {
      console.error('Error creating car:', error);
      throw new Error('Failed to create car');
    }
  }

  /**
   * Get a car by ID
   */
  static async getCarById(id: string): Promise<Car | null> {
    try {
      await dbConnect();
      const car = await CarModel.findById(id);
      if (!car) return null;
      const carObj = car.toJSON();
      (carObj as any).id = carObj._id?.toString();
      if ('_id' in carObj) delete (carObj as any)._id;
      if ('__v' in carObj) delete (carObj as any).__v;
      return carObj as unknown as Car;
    } catch (error) {
      console.error('Error getting car by ID:', error);
      throw new Error('Failed to get car');
    }
  }

  /**
   * Get all cars with optional filtering and pagination
   */
  static async getAllCars(
    filters: CarFilters = {},
    options: CarSearchOptions = {}
  ): Promise<{ cars: Car[]; total: number; page: number; totalPages: number }> {
    try {
      await dbConnect();
      
      const { page = 1, limit = 12, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      // Build query
      const query: Record<string, any> = {};

      if (filters.brand) {
        query.brand = { $regex: filters.brand, $options: 'i' };
      }

      if (filters.category) {
        query.category = { $regex: filters.category, $options: 'i' };
      }

      if (filters.transmission) {
        query.transmission = filters.transmission;
      }

      if (filters.fuel) {
        query.fuel = filters.fuel;
      }

      if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        query.dailyPrice = {} as { $gte?: number; $lte?: number };
        if (filters.minPrice !== undefined) {
          query.dailyPrice.$gte = filters.minPrice;
        }
        if (filters.maxPrice !== undefined) {
          query.dailyPrice.$lte = filters.maxPrice;
        }
      }

      if (filters.isAvailable !== undefined) {
        query.isAvailable = filters.isAvailable;
      }

      if (filters.isFeatured !== undefined) {
        query.isFeatured = filters.isFeatured;
      }

      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      if (filters.brandId) {
        query.brandId = filters.brandId;
      }

      if (filters.categoryId) {
        query.categoryId = filters.categoryId;
      }

      // Build sort object
      const sort: { [key: string]: 1 | -1 } = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [cars, total] = await Promise.all([
        CarModel.find(query)
          .populate('brandId')
          .populate('categoryId')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        CarModel.countDocuments(query)
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        cars: cars.map(car => {
          (car as any).id = car._id?.toString();
          if ('_id' in car) delete (car as any)._id;
          if ('__v' in car) delete (car as any).__v;
          return car as unknown as Car;
        }),
        total,
        page,
        totalPages
      };
    } catch (error) {
      console.error('Error getting all cars:', error);
      throw new Error('Failed to get cars');
    }
  }

  /**
   * Update a car
   */
  static async updateCar(id: string, updateData: UpdateCarData): Promise<Car | null> {
    try {
      await dbConnect();
      const car = await CarModel.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      );
      if (!car) return null;
      const carObj = car.toJSON();
      (carObj as any).id = carObj._id?.toString();
      if ('_id' in carObj) delete (carObj as any)._id;
      if ('__v' in carObj) delete (carObj as any).__v;
      return carObj as unknown as Car;
    } catch (error) {
      console.error('Error updating car:', error);
      throw new Error('Failed to update car');
    }
  }

  /**
   * Delete a car
   */
  static async deleteCar(id: string): Promise<boolean> {
    try {
      await dbConnect();
      const result = await CarModel.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      console.error('Error deleting car:', error);
      throw new Error('Failed to delete car');
    }
  }

  /**
   * Get featured cars
   */
  static async getFeaturedCars(limit: number = 6): Promise<Car[]> {
    try {
      await dbConnect();
      const cars = await CarModel.find({ isFeatured: true, isAvailable: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return cars.map(car => ({
        ...car,
        id: car._id?.toString(),
        _id: undefined,
        __v: undefined
      }));
    } catch (error) {
      console.error('Error getting featured cars:', error);
      throw new Error('Failed to get featured cars');
    }
  }

  /**
   * Get cars by brand
   */
  static async getCarsByBrand(brand: string, limit: number = 12): Promise<Car[]> {
    try {
      await dbConnect();
      const cars = await CarModel.find({ 
        brand: { $regex: brand, $options: 'i' },
        isAvailable: true 
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return cars.map(car => ({
        ...car,
        id: car._id?.toString(),
        _id: undefined,
        __v: undefined
      }));
    } catch (error) {
      console.error('Error getting cars by brand:', error);
      throw new Error('Failed to get cars by brand');
    }
  }

  /**
   * Get cars by category
   */
  static async getCarsByCategory(category: string, limit: number = 12): Promise<Car[]> {
    try {
      await dbConnect();
      const cars = await CarModel.find({ 
        category: { $regex: category, $options: 'i' },
        isAvailable: true 
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return cars.map(car => ({
        ...car,
        id: car._id?.toString(),
        _id: undefined,
        __v: undefined
      }));
    } catch (error) {
      console.error('Error getting cars by category:', error);
      throw new Error('Failed to get cars by category');
    }
  }

  /**
   * Search cars
   */
  static async searchCars(query: string, limit: number = 12): Promise<Car[]> {
    try {
      await dbConnect();
      const cars = await CarModel.find({
        $text: { $search: query },
        isAvailable: true
      })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean();

      return cars.map(car => ({
        ...car,
        id: car._id?.toString(),
        _id: undefined,
        __v: undefined
      }));
    } catch (error) {
      console.error('Error searching cars:', error);
      throw new Error('Failed to search cars');
    }
  }

  /**
   * Get car statistics
   */
  static async getCarStats(): Promise<{
    total: number;
    available: number;
    featured: number;
    brands: string[];
    categories: string[];
  }> {
    try {
      await dbConnect();
      
      const [total, available, featured, brands, categories] = await Promise.all([
        CarModel.countDocuments(),
        CarModel.countDocuments({ isAvailable: true }),
        CarModel.countDocuments({ isFeatured: true }),
        CarModel.distinct('brand'),
        CarModel.distinct('category')
      ]);

      return {
        total,
        available,
        featured,
        brands: brands.filter(Boolean),
        categories: categories.filter(Boolean)
      };
    } catch (error) {
      console.error('Error getting car stats:', error);
      throw new Error('Failed to get car statistics');
    }
  }
} 