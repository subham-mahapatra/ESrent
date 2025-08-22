import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/reviewService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('carId');
    const includeUnapproved = searchParams.get('includeUnapproved') === 'true';
    const featured = searchParams.get('featured') === 'true';
    const approved = searchParams.get('approved') === 'true';
    
    if (carId) {
      const reviews = await ReviewService.getReviewsByCarId(carId, includeUnapproved);
      return NextResponse.json({ success: true, data: reviews });
    } else if (featured && approved) {
      // Featured reviews endpoint for testimonials
      const reviews = await ReviewService.getFeaturedApprovedReviews();
      return NextResponse.json({ success: true, data: reviews });
    } else {
      // Admin endpoint - get all reviews
      const reviews = await ReviewService.getAllReviews();
      return NextResponse.json({ success: true, data: reviews });
    }
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { carId, userName, userEmail, rating, title, comment } = body;
    
    // Validate required fields
    if (!carId || !userName || !rating || !title || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }
    
    const review = await ReviewService.createReview({
      carId,
      userName,
      userEmail,
      rating,
      title,
      comment
    });
    
    return NextResponse.json({ 
      success: true, 
      data: review,
      message: 'Review submitted successfully. It will be visible after approval.'
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
