import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextRequest, NextResponse } from 'next/server';

export const GET = async (request: NextRequest) => {
  try {
    // Get the WorkOS AuthKit sign-in URL
    const signInUrl = await getSignInUrl();
    
    // Use NextResponse.redirect() instead of redirect() from next/navigation
    return NextResponse.redirect(signInUrl);
  } catch (error) {
    console.error('Login error:', error);
    // If there's an error, redirect to the homepage
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
  }
}; 