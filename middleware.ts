import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authkit } from '@workos-inc/authkit-nextjs';

// Define paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/login/', // Include trailing slash variant
  '/login/success', // Include potential success path 
  '/auth/callback',
  '/auth/sso',
  '/auth/sso-callback',
  '/auth/verify',
  '/api/auth/signout',  // Make sure signout endpoint is accessible
  '/api/auth/check-session',  // Allow checking session status
  // Add other public paths as needed
];

// Define paths that should never be cached (auth-related)
const noCachePaths = [
  '/auth/sso',
  '/auth/callback',
  '/auth/verify',
  '/api/auth/signout',
  '/api/auth/check-session',
  '/login'
];

// We want to avoid redirect loops, so we'll track recent redirects
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`)
  );
};

// Custom middleware for adding no-cache headers to auth routes
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Create the response using the authkit middleware
  const { session, headers, authorizationUrl } = await authkit(request, {
    debug: process.env.NODE_ENV === 'development'
  });

  // Handle what to do based on the session status
  let response: NextResponse;
  
  // Check if this is a protected route and user isn't authenticated
  const needsAuth = !isPublicPath(pathname) && !session.user;
  if (needsAuth) {
    // User isn't authenticated and the path needs auth
    if (authorizationUrl) {
      response = NextResponse.redirect(authorizationUrl);
    } else {
      // If no authorization URL is available, redirect to login
      response = NextResponse.redirect(`${request.nextUrl.origin}/login`);
    }
  } else {
    // User has valid session or the path is public
    response = NextResponse.next({
      headers
    });
  }
  
  // Add cache control headers to auth-related paths to prevent caching
  const shouldNotCache = noCachePaths.some(path => pathname.startsWith(path));
  if (shouldNotCache) {
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }
  
  return response;
}

// Match against all pages except static assets
export const config = { 
  matcher: [
    // Match all paths except static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    
    // Explicitly match all auth-related paths to ensure middleware runs on them
    '/auth/:path*',
    '/api/auth/:path*',
    '/login',
    '/dashboard',
  ],
}; 