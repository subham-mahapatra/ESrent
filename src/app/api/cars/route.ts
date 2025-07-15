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
    if (searchParams.get('brand')) filters.brand = searchParams.get('brand')!;
    if (searchParams.get('category')) filters.category = searchParams.get('category')!;
    if (searchParams.get('transmission')) filters.transmission = searchParams.get('transmission')!;
    if (searchParams.get('fuel')) filters.fuel = searchParams.get('fuel')!;
    if (searchParams.get('minPrice')) filters.minPrice = Number(searchParams.get('minPrice'));
    if (searchParams.get('maxPrice')) filters.maxPrice = Number(searchParams.get('maxPrice'));
    if (searchParams.get('isAvailable')) filters.isAvailable = searchParams.get('isAvailable') === 'true';
    if (searchParams.get('isFeatured')) filters.isFeatured = searchParams.get('isFeatured') === 'true';
    if (searchParams.get('search')) filters.search = searchParams.get('search')!;

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
    const requiredFields = ['brand', 'model', 'name', 'year', 'transmission', 'fuel', 'mileage', 'dailyPrice', 'images'];
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