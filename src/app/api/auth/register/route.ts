import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/userService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['email', 'password', 'name', 'role'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate role
    if (!['admin', 'super_admin'].includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin or super_admin' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserService.getUserByEmail(body.email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await UserService.createUser(body);
    
    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 