import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@workos-inc/authkit-nextjs';

// This endpoint checks if the current user session is valid
export async function GET(request: NextRequest) {
  try {
    // Attempt to get the current user without redirecting
    const { user, sessionId } = await withAuth();
    
    // If user is not authenticated, return a 401
    if (!user || !sessionId) {
      return NextResponse.json({ 
        authenticated: false,
        message: 'User is not authenticated'
      }, { status: 401 });
    }
    
    // Return user info if authenticated
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      sessionId: sessionId
    });
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Error checking session'
    }, { status: 500 });
  }
} 