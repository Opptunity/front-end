import { NextRequest, NextResponse } from 'next/server';
import { getWorkOS, withAuth } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';

// Get the WorkOS logout URL to properly invalidate the session
async function getWorkOSLogoutUrl(returnTo?: string) {
  let sessionId: string | undefined;

  try {
    // Get the current auth session which contains the sessionId
    const { sessionId: sid } = await withAuth();
    sessionId = sid;
    console.log('Found session ID for logout:', sessionId);
  } catch (error) {
    console.error('Error getting session ID:', error);
  }

  // If we have a sessionId, get the official WorkOS logout URL
  if (sessionId) {
    const workos = getWorkOS();
    const logoutUrl = workos.userManagement.getLogoutUrl({ 
      sessionId, 
      returnTo: returnTo || `${process.env.FRONTEND_URL || ''}/auth/sso?fresh=true&logout=complete` 
    });
    console.log('Generated WorkOS logout URL:', logoutUrl);
    return logoutUrl;
  }

  // Fallback to our custom logout URL if no session ID is available
  return `${process.env.FRONTEND_URL || ''}/auth/sso?fresh=true&logout=complete`;
}

// Clear all auth cookies
function clearAllAuthCookies(response: NextResponse) {
  // List of all cookies that might be set by auth processes
  const cookiesToClear = [
    'authkit',
    'backendAuthToken', 
    'userEmail',
    '_workos_session',
    'workos_token',
    'workos.session',
    'workos.user',
    'workos.auth',
    'wos-session'  // Add the official WorkOS cookie name
  ];
  
  // Clear all cookies
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
  
  return response;
}

// This endpoint is dedicated to WorkOS sign-out with proper session invalidation
export async function GET(request: NextRequest) {
  try {
    console.log('WorkOS signout starting...');
    
    // Get the official WorkOS logout URL
    const logoutUrl = await getWorkOSLogoutUrl();
    
    // Create a response that redirects to the WorkOS logout URL
    const response = NextResponse.redirect(logoutUrl);
    
    // Clear all auth cookies
    return clearAllAuthCookies(response);
  } catch (error) {
    console.error('Error during WorkOS sign out:', error);
    
    // Even if there's an error, attempt to redirect to the logout page
    const fallbackUrl = `${request.nextUrl.origin}/auth/sso?fresh=true&logout=complete`;
    const response = NextResponse.redirect(fallbackUrl);
    
    // Still try to clear cookies
    return clearAllAuthCookies(response);
  }
}

// For API calls that want a JSON response instead of redirect
export async function POST(request: NextRequest) {
  try {
    console.log('WorkOS signout POST handler starting...');
    
    // Get the official WorkOS logout URL
    const baseUrl = request.nextUrl.origin;
    const returnTo = `${baseUrl}/auth/sso?fresh=true&logout=complete`;
    const logoutUrl = await getWorkOSLogoutUrl(returnTo);
    
    // Create a response with the redirect URL
    const response = NextResponse.json({ 
      success: true,
      message: 'Successfully signed out',
      redirectUrl: logoutUrl
    });
    
    // Clear all auth cookies
    return clearAllAuthCookies(response);
  } catch (error) {
    console.error('Error during POST sign out:', error);
    
    // If there's an error, still try to build a fallback logout URL
    const baseUrl = request.nextUrl.origin;
    const fallbackLogoutUrl = `${baseUrl}/auth/sso?fresh=true&logout=complete`;
    
    const response = NextResponse.json({ 
      success: false, 
      error: 'Failed to sign out',
      redirectUrl: fallbackLogoutUrl 
    }, { status: 500 });
    
    // Still try to clear cookies
    return clearAllAuthCookies(response);
  }
} 