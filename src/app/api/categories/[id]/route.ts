import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/categoryService';
import { requireAdmin } from '@/lib/middleware/auth';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const category = await CategoryService.getCategoryById(id);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in GET /api/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const { id } = params;
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Validate type enum if provided
    if (body.type) {
      const validTypes = ['carType', 'fuelType', 'tag'];
      if (!validTypes.includes(body.type)) {
        return NextResponse.json(
          { error: 'Invalid type. Must be one of: carType, fuelType, tag' },
          { status: 400 }
        );
      }
    }

    const category = await CategoryService.updateCategory(id, body);
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in PUT /api/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const success = await CategoryService.deleteCategory(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 