import { NextRequest, NextResponse } from 'next/server';
import { CarService } from '@/lib/services/carService';
import { requireAdmin } from '@/lib/middleware/auth';

function getIdFromRequest(request: NextRequest): string {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  return parts[parts.length - 1];
}

export async function GET(request: NextRequest) {
  try {
    const id = getIdFromRequest(request);
    if (!id) {
      return NextResponse.json(
        { error: 'Car ID is required' },
        { status: 400 }
      );
    }

    const car = await CarService.getCarById(id);
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error in GET /api/cars/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch car' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const id = getIdFromRequest(request);
    const body = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Car ID is required. Please provide a valid car ID.' },
        { status: 400 }
      );
    }
    
    // Validate required fields for updates
    if (body.name && !body.name.trim()) {
      return NextResponse.json(
        { error: 'Car name cannot be empty. Please provide a valid name.' },
        { status: 400 }
      );
    }
    
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

    const car = await CarService.updateCar(id, body);
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found. The car may have been deleted or the ID is incorrect.' },
        { status: 404 }
      );
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Error in PUT /api/cars/[id]:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
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
      if (error.message.includes('Cast to ObjectId failed')) {
        return NextResponse.json(
          { error: 'Invalid car ID format. Please provide a valid car ID.' },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to update car. Please try again or contact support if the problem persists.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const authResult = await requireAdmin(request);
    if (authResult) return authResult;

    const id = getIdFromRequest(request);
    if (!id) {
      return NextResponse.json(
        { error: 'Car ID is required' },
        { status: 400 }
      );
    }

    const success = await CarService.deleteCar(id);
    if (!success) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/cars/[id]:', error);
    return NextResponse.json(
      { error: 'Failed to delete car' },
      { status: 500 }
    );
  }
} 