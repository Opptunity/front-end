# Setting up WorkOS AuthKit

This document provides instructions for setting up WorkOS AuthKit for direct SSO authentication without requiring redirection through a backend server.

## Required Environment Variables

Create or update your `.env` file with the following variables:

```
# WorkOS AuthKit Configuration
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_REDIRECT_URI=http://localhost:3000/auth/callback
WORKOS_COOKIE_NAME=authkit
WORKOS_COOKIE_DOMAIN=localhost

# Backend API URL (if still needed for other features)
NEXT_PUBLIC_AUTH_API_URL=http://localhost:4000
```

## Environment Variable Descriptions

- `WORKOS_API_KEY`: Your WorkOS API key obtained from the WorkOS dashboard
- `WORKOS_CLIENT_ID`: Your WorkOS Client ID obtained from the WorkOS dashboard
- `WORKOS_REDIRECT_URI`: The callback URL after successful authentication (must match URL in WorkOS dashboard)
- `WORKOS_COOKIE_NAME`: Name of the cookie used by AuthKit (can remain as default)
- `WORKOS_COOKIE_DOMAIN`: Domain for the cookie (use your application domain in production)

## Setup Process

1. Sign in to your WorkOS dashboard: https://dashboard.workos.com/
2. Obtain your API key and Client ID
3. Set up your redirect URI in the WorkOS dashboard
4. Add the above environment variables to your `.env` file
5. Make sure your middleware is properly configured (already done)

## Testing

To test the SSO implementation:

1. Start your development server
2. Navigate to `/auth/sso`
3. The server-side route handler will automatically redirect you to the WorkOS authentication page
4. After successful authentication, you'll be redirected to your application

## Important Files in the Implementation

1. **SSO Route Handler (app/auth/sso/route.ts)**
   - Handles the server-side redirection to WorkOS
   - Uses AuthKit's `getSignInUrl()` function to get the sign-in URL

2. **SSO Page Component (app/auth/sso/page.tsx)**
   - Simple loading UI that is shown briefly before redirection
   - The actual authentication logic is in the route handler

3. **Authentication Callback (app/auth/callback/route.ts)**
   - Handles the callback from WorkOS after successful authentication
   - Uses AuthKit's `handleAuth()` function to complete the authentication flow

4. **Middleware (middleware.ts)**
   - Configures AuthKit middleware for protected routes
   - Defines which paths don't require authentication

## Implementation Notes

- The implementation uses a server-side route handler to initiate the WorkOS authentication
- This approach avoids client-side Node.js module compatibility issues
- AuthKit middleware automatically protects routes based on the configuration
- The authentication state is provided through the `useAuth()` hook for client components

## Important Notes

- The implementation uses WorkOS AuthKit directly without going through your backend
- The authentication is handled server-side by the `/login` route to avoid client-side crypto module issues
- The authentication callback is handled by the `handleAuth` function in `app/auth/callback/route.ts`
- This implementation assumes you've already set up your organization in WorkOS with the appropriate identity provider 