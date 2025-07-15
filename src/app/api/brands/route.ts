import { NextRequest, NextResponse } from 'next/server';
import { BrandService, BrandFilters, BrandSearchOptions } from '@/lib/services/brandService';
import { requireAdmin } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  console.log("try")
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const filters: BrandFilters = {};
    const searchOptions: BrandSearchOptions = {};

    // Filter parameters
    if (searchParams.get('featured')) filters.featured = searchParams.get('featured') === 'true';
    if (searchParams.get('search')) filters.search = searchParams.get('search')!;

    // Pagination and sorting
    if (searchParams.get('page')) searchOptions.page = Number(searchParams.get('page'));
    if (searchParams.get('limit')) searchOptions.limit = Number(searchParams.get('limit'));
    if (searchParams.get('sortBy')) searchOptions.sortBy = searchParams.get('sortBy')!;
    if (searchParams.get('sortOrder')) searchOptions.sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc';

    const result = await BrandService.getAllBrands(filters, searchOptions);
    console.log('API /api/brands response:', {
      data: result.brands,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
    // Patch: return { data, total, page, totalPages } to match frontend expectation
    return NextResponse.json({
      data: result.brands,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages
    });
  } catch (error) {
    console.error('Error in GET /api/brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
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
    const requiredFields = ['name', 'logo', 'slug'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const brand = await BrandService.createBrand(body);
    
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/brands:', error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
} 