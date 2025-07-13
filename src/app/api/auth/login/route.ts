import { NextRequest, NextResponse } from 'next/server';
import { UserService, LoginCredentials } from '@/lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    
    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const authResult = await UserService.authenticateUser(body);
    
    if (!authResult) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: authResult.user,
      token: authResult.token,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error in POST /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 