import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authkit } from '@workos-inc/authkit-nextjs';

// Define paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/login/', 
  '/login/success',
  '/auth/callback',
  '/auth/sso',
  '/auth/sso-callback',
  '/auth/verify',
  '/api/auth/signout',
  '/api/auth/check-session',
  '/assessment',
];

// Define paths that should skip session validation entirely (fresh login)
const freshAuthPaths = [
  '/login',
  '/auth/sso',
  '/auth/callback',
  '/auth/sso-callback'
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

const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`)
  );
};

const isFreshAuthPath = (path: string) => {
  return freshAuthPaths.some(authPath => 
    path === authPath || 
    path.startsWith(`${authPath}/`)
  );
};

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // For fresh auth paths, skip session validation entirely
  if (isFreshAuthPath(pathname)) {
    console.log(`Skipping session check for fresh auth path: ${pathname}`);
    
    // Create response without session validation
    const response = NextResponse.next();
    
    // Add no-cache headers
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
  
  // For all other paths, run normal authkit middleware
  try {
    const { session, headers, authorizationUrl } = await authkit(request, {
      debug: process.env.NODE_ENV === 'development'
    });

    let response: NextResponse;
    
    // Check if this is a protected route and user isn't authenticated
    const needsAuth = !isPublicPath(pathname) && !session.user;
    if (needsAuth) {
      if (authorizationUrl) {
        response = NextResponse.redirect(authorizationUrl);
      } else {
        response = NextResponse.redirect(`${request.nextUrl.origin}/login`);
      }
    } else {
      response = NextResponse.next({ headers });
    }
    
    // Add cache control headers to auth-related paths
    const shouldNotCache = noCachePaths.some(path => pathname.startsWith(path));
    if (shouldNotCache) {
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
    }
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    
    // If middleware fails, allow public paths through
    if (isPublicPath(pathname)) {
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
      return response;
    }
    
    // For protected paths, redirect to login
    return NextResponse.redirect(`${request.nextUrl.origin}/login`);
  }
}

export const config = { 
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
    '/auth/:path*',
    '/api/auth/:path*',
    '/login',
    '/dashboard',
  ],
}; 