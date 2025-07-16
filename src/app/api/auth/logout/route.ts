import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // For stateless JWT, logout is handled client-side by removing the token.
  // This endpoint exists for completeness or future server-side invalidation.
  return NextResponse.json({ message: 'Logout successful' });
} 