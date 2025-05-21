import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextResponse, NextRequest } from 'next/server';

// Using NextResponse.redirect() instead of next/navigation's redirect to avoid client-side redirect errors
export const GET = async (request: NextRequest) => {
  try {
    // Check URL parameters
    const searchParams = request.nextUrl.searchParams;
    const forceFresh = searchParams.get('fresh') === 'true';
    const completedLogout = searchParams.get('logout') === 'complete';
    
    if (completedLogout) {
      console.log('User has completed logout process, forcing fresh login session');
    }
    
    // Get the WorkOS AuthKit sign-in URL
    let signInUrl = await getSignInUrl();
    
    // Force a fresh login by appending prompt=login when either:
    // 1. The fresh=true parameter is present, or
    // 2. The logout=complete parameter is present (came from logout flow)
    if (forceFresh || completedLogout) {
      console.log('Forcing a fresh login session with prompt=login');
      signInUrl = signInUrl + (signInUrl.includes('?') ? '&' : '?') + 'prompt=login';
    }
    
    // Clear any auth cookies just to be sure - especially important after logout
    const response = NextResponse.redirect(signInUrl);
    if (forceFresh || completedLogout) {
      response.cookies.set({
        name: 'authkit',
        value: '',
        expires: new Date(0),
        path: '/'
      });
      
      response.cookies.set({
        name: 'backendAuthToken',
        value: '',
        expires: new Date(0),
        path: '/'
      });
      
      response.cookies.set({
        name: 'userEmail',
        value: '',
        expires: new Date(0),
        path: '/'
      });
      
      // Also clear any WorkOS specific cookies that might be present
      response.cookies.set({
        name: '_workos_session',
        value: '',
        expires: new Date(0),
        path: '/' 
      });
      
      response.cookies.set({
        name: 'workos_token',
        value: '',
        expires: new Date(0),
        path: '/'
      });
    }
    
    return response;
  } catch (error) {
    console.error('SSO error:', error);
    // Redirect to homepage in case of error
    return NextResponse.redirect(new URL('/', process.env.FRONTEND_URL || 'http://localhost:3000'));
  }
}; 