import { NextRequest, NextResponse } from 'next/server';
import { CategoryService, CategoryFilters, CategorySearchOptions } from '@/lib/services/categoryService';
import { requireAdmin } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Check if we want categories with car counts
    const withCarCounts = searchParams.get('withCarCounts') === 'true';
    
    if (withCarCounts) {
      const categories = await CategoryService.getAllCategoriesWithCarCounts();
      return NextResponse.json({ data: categories });
    }
    
    // Parse filters
    const filters: CategoryFilters = {};
    const searchOptions: CategorySearchOptions = {};

    // Filter parameters
    if (searchParams.get('type')) filters.type = searchParams.get('type') as 'carType' | 'fuelType' | 'tag';
    if (searchParams.get('featured')) filters.featured = searchParams.get('featured') === 'true';
    if (searchParams.get('search')) filters.search = searchParams.get('search')!;

    // Pagination and sorting
    if (searchParams.get('page')) searchOptions.page = Number(searchParams.get('page'));
    if (searchParams.get('limit')) searchOptions.limit = Number(searchParams.get('limit'));
    if (searchParams.get('sortBy')) searchOptions.sortBy = searchParams.get('sortBy')!;
    if (searchParams.get('sortOrder')) searchOptions.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

    const result = await CategoryService.getAllCategories(filters, searchOptions);
    // Always return { data: categories, ... } for frontend compatibility
    return NextResponse.json({
      data: result.categories,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Error in GET /api/categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'slug', 'type'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate type enum
    const validTypes = ['carType', 'fuelType', 'transmission', 'tag'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: carType, fuelType, transmission, tag' },
        { status: 400 }
      );
    }

    const category = await CategoryService.createCategory(body);
    
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/categories:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 