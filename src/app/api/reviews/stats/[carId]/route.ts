import { NextRequest, NextResponse } from 'next/server';
import { ReviewService } from '@/lib/services/reviewService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ carId: string }> }
) {
  const { carId } = await params;
  try {
    const stats = await ReviewService.getReviewStats(carId);
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review statistics' },
      { status: 500 }
    );
  }
}
