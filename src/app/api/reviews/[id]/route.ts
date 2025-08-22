import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/reviewService';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { userName, userEmail, rating, title, comment } = body;
    
    // Validate required fields
    if (!userName || !rating || !title || !comment) {
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
    
    const review = await ReviewService.updateReview(id, {
      userName,
      userEmail,
      rating,
      title,
      comment
    });
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const review = await ReviewService.deleteReview(id);
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { action } = body;
    
    let review;
    
    switch (action) {
      case 'approve':
        review = await ReviewService.approveReview(id);
        break;
      case 'reject':
        review = await ReviewService.rejectReview(id);
        return NextResponse.json({ 
          success: true, 
          message: 'Review rejected and deleted successfully' 
        });
      case 'toggleFeatured':
        review = await ReviewService.toggleFeatured(id);
        break;
      case 'delete':
        review = await ReviewService.deleteReview(id);
        return NextResponse.json({ 
          success: true, 
          message: 'Review deleted successfully' 
        });
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update review status' },
      { status: 500 }
    );
  }
}
