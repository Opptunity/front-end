import { getWorkOS } from '@workos-inc/authkit-nextjs';
import { NextResponse, NextRequest } from 'next/server';

// Using NextResponse.redirect() instead of next/navigation's redirect to avoid client-side redirect errors
export const GET = async (request: NextRequest) => {
  console.log('SSO route: Starting fresh authentication flow');
  
  try {
    // Always force fresh authentication - don't check existing session
    const searchParams = request.nextUrl.searchParams;
    const forceFresh = searchParams.get('fresh') === 'true';
    const completedLogout = searchParams.get('logout') === 'complete';
    
    console.log('SSO parameters:', { forceFresh, completedLogout });
    
    // Get WorkOS instance
    const workos = getWorkOS();
    
    // Build authorization options for fresh login
    const options: any = {
      provider: 'authkit',
      redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || 'http://localhost:3000/auth/callback',
      clientId: process.env.WORKOS_CLIENT_ID,
      // Always force fresh login
      prompt: 'login',
      max_age: '0'
    };
    
    console.log('Getting fresh authorization URL from WorkOS...');
    
    // Get the authorization URL - this creates a NEW session
    const signInUrl = await workos.userManagement.getAuthorizationUrl(options);
    
    console.log('Successfully generated authorization URL');
    
    // Create redirect response
    const response = NextResponse.redirect(signInUrl);
    
    // Clear any existing auth cookies to ensure fresh start
    const cookiesToClear = [
      'authkit',
      'backendAuthToken', 
      'userEmail',
      '_workos_session',
      'workos_token',
      'workos.session',
      'workos.user',
      'workos.auth'
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: '',
        expires: new Date(0),
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
    });
    
    // Set headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error('SSO route error:', error);
    
    // If there's an error, redirect to a safe fallback
    return NextResponse.redirect(new URL('/', process.env.FRONTEND_URL || 'http://localhost:3000'));
  }
}; 