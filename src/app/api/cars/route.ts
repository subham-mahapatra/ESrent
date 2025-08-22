import { NextRequest, NextResponse } from 'next/server';
import { CarService, CarFilters, CarSearchOptions } from '@/lib/services/carService';
import { requireAdmin } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    // console.log('GET /api/cars called');
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: CarFilters = {};
    const searchOptions: CarSearchOptions = {};

    // Filter parameters
    const brand = searchParams.get('brand');
    if (brand !== null) filters.brand = brand;
    const carTypeId = searchParams.get('carTypeId');
    if (carTypeId !== null) filters.carTypeId = carTypeId;
    const transmissionId = searchParams.get('transmissionId');
    if (transmissionId !== null) filters.transmissionId = transmissionId;
    const fuelTypeId = searchParams.get('fuelTypeId');
    if (fuelTypeId !== null) filters.fuelTypeId = fuelTypeId;
    const available = searchParams.get('available');
    if (available !== null) filters.available = available === 'true';
    const featured = searchParams.get('featured');
    if (featured !== null) filters.featured = featured === 'true';
    const search = searchParams.get('search');
    if (search !== null) filters.search = search;
    const brandId = searchParams.get('brandId');
    if (brandId !== null) filters.brandId = brandId;

    // Pagination and sorting
    if (searchParams.get('page')) searchOptions.page = Number(searchParams.get('page'));
    if (searchParams.get('limit')) searchOptions.limit = Number(searchParams.get('limit'));
    if (searchParams.get('sortBy')) searchOptions.sortBy = searchParams.get('sortBy')!;
    if (searchParams.get('sortOrder')) searchOptions.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

    // console.log('Filters:', filters);
    // console.log('Search Options:', searchOptions);

    const result = await CarService.getAllCars(filters, searchOptions);
    // console.log('GET /api/cars result:', result);
    
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
    // console.log('POST /api/cars called');
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const body = await request.json();
    // console.log('POST /api/cars body:', body);
    
    // Validate required fields with specific error messages
    const requiredFields = [
      { field: 'brand', name: 'Brand' },
      { field: 'brandId', name: 'Brand ID' },
      { field: 'model', name: 'Model' },
      { field: 'name', name: 'Car Name' },
      { field: 'originalPrice', name: 'Original Price' },
      { field: 'images', name: 'Images' },
      { field: 'carTypeIds', name: 'Car Type' }
    ];
    
    for (const { field, name } of requiredFields) {
      if (!body[field] || (Array.isArray(body[field]) && body[field].length === 0)) {
        console.warn(`Missing required field: ${field}`);
        return NextResponse.json(
          { error: `${name} is required. Please provide a valid ${name.toLowerCase()}.` },
          { status: 400 }
        );
      }
    }
    
    // Additional validations
    if (body.originalPrice && (isNaN(body.originalPrice) || body.originalPrice <= 0)) {
      return NextResponse.json(
        { error: 'Original price must be a positive number.' },
        { status: 400 }
      );
    }
    
    if (body.discountedPrice && (isNaN(body.discountedPrice) || body.discountedPrice < 0)) {
      return NextResponse.json(
        { error: 'Discounted price must be a non-negative number.' },
        { status: 400 }
      );
    }
    
    if (body.discountedPrice && body.originalPrice && body.discountedPrice >= body.originalPrice) {
      return NextResponse.json(
        { error: 'Discounted price must be less than the original price.' },
        { status: 400 }
      );
    }
    
    if (body.images && (!Array.isArray(body.images) || body.images.length === 0)) {
      return NextResponse.json(
        { error: 'At least one image is required.' },
        { status: 400 }
      );
    }
    
    if (body.carTypeIds && (!Array.isArray(body.carTypeIds) || body.carTypeIds.length === 0)) {
      return NextResponse.json(
        { error: 'At least one car type must be selected.' },
        { status: 400 }
      );
    }

    const car = await CarService.createCar(body);
    console.log('POST /api/cars created car:', car);
    
    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/cars:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('originalPrice is required')) {
        return NextResponse.json(
          { error: 'Original price is required. Please provide a valid price.' },
          { status: 400 }
        );
      }
      if (error.message.includes('duplicate key error')) {
        return NextResponse.json(
          { error: 'A car with this name already exists. Please choose a different name.' },
          { status: 409 }
        );
      }
      if (error.message.includes('validation failed')) {
        return NextResponse.json(
          { error: 'Car data validation failed. Please check all required fields.' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create car. Please try again or contact support if the problem persists.' },
      { status: 500 }
    );
  }
} 