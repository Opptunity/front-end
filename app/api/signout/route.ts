import { NextRequest, NextResponse } from 'next/server';

// This endpoint handles only the backend sign-out, not WorkOS sign-out
export async function GET(request: NextRequest) {
  try {
    // Check if this is an API call or a browser visit
    const acceptHeader = request.headers.get('accept');
    const isAPICall = acceptHeader && acceptHeader.includes('application/json');
    
    if (isAPICall) {
      // Return JSON for API calls
      const response = NextResponse.json({ 
        success: true,
        message: 'Successfully logged out'
      });
      
      // Set an expired cookie to clear it
      response.cookies.set({
        name: 'backendAuthToken',
        value: '',
        expires: new Date(0),
        path: '/'
      });
      
      return response;
    } else {
      // For browser visits, redirect to the WorkOS sign-out URL
      // This will let WorkOS handle the redirection
      // We must use an abso  lute URL for NextResponse.redirect()
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const authSignoutUrl = `${protocol}://${host}/api/auth/signout`;
      
      return NextResponse.redirect(authSignoutUrl);
    }
  } catch (error) {
    console.error('Error during sign out:', error);
    
    // Check if this is an API call or a browser visit
    const acceptHeader = request.headers.get('accept');
    const isAPICall = acceptHeader && acceptHeader.includes('application/json');
    
    if (isAPICall) {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to sign out'
      }, { status: 500 });
    } else {
      // Redirect to home page with error param - using absolute URL
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const host = request.headers.get('host') || 'localhost:3000';
      const errorUrl = `${protocol}://${host}/?error=signout_failed`;
      
      return NextResponse.redirect(errorUrl);
    }
  }
}

// Also handle POST requests for frontend fetch calls
export async function POST(request: NextRequest) {
  return GET(request);
}
