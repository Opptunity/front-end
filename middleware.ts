import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { authkitMiddleware } from '@workos-inc/authkit-nextjs';

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
  // Add other public paths as needed
];

// We want to avoid redirect loops, so we'll track recent redirects
const isPublicPath = (path: string) => {
  return publicPaths.some(publicPath => 
    path === publicPath || 
    path.startsWith(`${publicPath}/`)
  );
};

// Setup WorkOS AuthKit middleware
export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    // Define paths that don't require authentication
    unauthenticatedPaths: publicPaths,
  },
});

// Match against all pages except static assets and API routes
export const config = { 
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}; 