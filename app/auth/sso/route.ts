import { getWorkOS } from '@workos-inc/authkit-nextjs';
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
    
    // Get direct access to WorkOS SDK to use additional parameters
    const workos = getWorkOS();
    
    // Build authorization options
    const options: any = {
      provider: 'authkit',
      redirectUri: process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI || 'http://localhost:3000/auth/callback',
      clientId: process.env.WORKOS_CLIENT_ID,
    };
    
    // Add parameters to force fresh login when needed
    if (forceFresh || completedLogout) {
      options.state = JSON.stringify({ requireNewLogin: true });
      options.prompt = 'login'; // Force showing login screen
      options.max_age = '0';    // Force re-authentication
      console.log('Forcing a completely fresh login session with prompt=login and max_age=0');
    }
    
    // Get the authorization URL with our custom options
    const signInUrl = await workos.userManagement.getAuthorizationUrl(options);
    
    // Clear any auth cookies just to be sure - especially important after logout
    const response = NextResponse.redirect(signInUrl);
    if (forceFresh || completedLogout) {
      // Clear all possible auth cookies
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
          path: '/'
        });
      });
      
      // Set cache control to prevent caching
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    return response;
  } catch (error) {
    console.error('SSO error:', error);
    // Redirect to homepage in case of error
    return NextResponse.redirect(new URL('/', process.env.FRONTEND_URL || 'http://localhost:3000'));
  }
}; 