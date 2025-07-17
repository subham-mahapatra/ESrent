import { NextRequest, NextResponse } from 'next/server';
import { CarService, CarFilters, CarSearchOptions } from '@/lib/services/carService';
import { requireAdmin } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/cars called');
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: CarFilters = {};
    const searchOptions: CarSearchOptions = {};

    // Filter parameters
    const brand = searchParams.get('brand');
    if (brand !== null) filters.brand = brand;
    const category = searchParams.get('category');
    if (category !== null) filters.category = category;
    const categoryId = searchParams.get('categoryId');
    if (categoryId !== null) filters.categoryId = categoryId;
    const transmission = searchParams.get('transmission');
    if (transmission !== null) filters.transmission = transmission;
    const fuel = searchParams.get('fuel');
    if (fuel !== null) filters.fuel = fuel;
    const search = searchParams.get('search');
    if (search !== null) filters.search = search;
    const brandId = searchParams.get('brandId');
    if (brandId !== null) filters.brandId = brandId;

    // Pagination and sorting
    if (searchParams.get('page')) searchOptions.page = Number(searchParams.get('page'));
    if (searchParams.get('limit')) searchOptions.limit = Number(searchParams.get('limit'));
    if (searchParams.get('sortBy')) searchOptions.sortBy = searchParams.get('sortBy')!;
    if (searchParams.get('sortOrder')) searchOptions.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

    console.log('Filters:', filters);
    console.log('Search Options:', searchOptions);

    const result = await CarService.getAllCars(filters, searchOptions);
    console.log('GET /api/cars result:', result);
    
    return NextResponse.json({
      data: result.cars,
      total: result.total,
      page: result.page,
      limit: searchOptions.limit || 12,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Error in GET /api/cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/cars called');
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const body = await request.json();
    console.log('POST /api/cars body:', body);
    
    // Validate required fields
    const requiredFields = ['brand', 'brandId', 'model', 'name', 'year', 'transmission', 'fuel', 'mileage', 'dailyPrice', 'images'];
    for (const field of requiredFields) {
      if (!body[field]) {
        console.warn(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const car = await CarService.createCar(body);
    console.log('POST /api/cars created car:', car);
    
    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/cars:', error);
    return NextResponse.json(
      { error: 'Failed to create car' },
      { status: 500 }
    );
  }
} 