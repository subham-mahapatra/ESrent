import { NextRequest, NextResponse } from 'next/server';
import { CarService } from '@/lib/services/carService';

export async function GET(request: NextRequest) {
  try {
    // console.log('GET /api/cars/list called');
    
    // Get all cars without pagination for the review form
    const result = await CarService.getAllCars({}, { limit: 1000 });
    // console.log('GET /api/cars/list result:', result);
    
    return NextResponse.json({
      success: true,
      data: result.cars
    });
  } catch (error) {
    console.error('Error in GET /api/cars/list:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}
