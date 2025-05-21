import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import { getWorkOS } from '@workos-inc/authkit-nextjs';

// Initialize WorkOS client with error handling for missing API key
const workosApiKey = process.env.WORKOS_API_KEY;
if (!workosApiKey) {
  console.error('WORKOS_API_KEY environment variable is not set. Session revocation will not work.');
}
const workos = new WorkOS(workosApiKey || '');

// This endpoint is dedicated to WorkOS sign-out using the direct WorkOS logout URL
export async function GET(request: NextRequest) {
  try {
    console.log('WorkOS direct signout starting...');
    
    // The authkit cookie has the session information encrypted
    // We'll focus on clearing cookies instead of trying to revoke the session
    console.log('Clearing cookies without attempting session revocation');
    
    // Clear all cookies first
    const response = NextResponse.json({ 
      success: true, 
      message: 'Redirecting to WorkOS logout' 
    });
    
    // Clear all authentication cookies
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
    
    // Also clear WorkOS specific cookies
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
    
    // Return JSON with instructions for the client
    return response;
  } catch (error) {
    console.error('Error during WorkOS sign out:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to sign out'
    }, { status: 500 });
  }
}

// For API calls that want a JSON response instead of redirect
export async function POST(request: NextRequest) {
  try {
    console.log('WorkOS signout POST handler starting...');
    
    // Get cookie from request body if present
    const body = await request.json().catch(() => ({}));
    const { authkitCookie } = body || {};
    
    if (authkitCookie) {
      console.log('Received authkit cookie from client');
      // The proper way to sign out is by using the WorkOS logout URL
      // Session revocation is best done through the AuthKit itself
    }
    
    // Create a success response
    const response = NextResponse.json({ 
      success: true,
      message: 'Successfully signed out from backend',
      redirectTo: '/auth/sso' // Tell client where to redirect
    });
    
    // Clear auth cookies by setting expired values
    console.log('Setting authkit cookie to expired');
    response.cookies.set({
      name: 'authkit',
      value: '',
      expires: new Date(0),
      path: '/'
    });
    
    console.log('Setting backendAuthToken cookie to expired');
        response.cookies.set({
      name: 'backendAuthToken',
          value: '',
      expires: new Date(0),
      path: '/'
        });
    
    // Also try to clear other potential auth cookies
    console.log('Setting userEmail cookie to expired');
    response.cookies.set({
      name: 'userEmail',
      value: '',
      expires: new Date(0),
      path: '/'
    });
    
    // Also clear WorkOS specific cookies
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
    
    // Set cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    
    console.log('WorkOS signout POST response prepared with cleared cookies');
    
    return response;
  } catch (error) {
    console.error('Error during POST sign out:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to sign out',
      redirectTo: '/auth/sso' // Still tell client where to redirect even on error
    }, { status: 500 });
  }
} 