# Setting up SSO Authentication

This document guides you through the setup process for Single Sign-On (SSO) authentication with Opptunity.

## Environment Variables

You'll need to configure the following environment variables in your `.env` file:

```
NEXT_PUBLIC_AUTH_API_URL=http://localhost:4000  # URL to your authentication backend server
```

## Integration Overview

The SSO authentication is integrated into the sign-in process and validates users' email domains before initiating the authentication flow. This ensures only users with authorized email domains can use SSO.

### Backend API Endpoints

The SSO integration relies on these endpoints:

- `/api/users/validate-email` - Validates if the email domain is allowed for SSO
- `/api/sso/authorize` - Initiates the SSO flow with WorkOS using an organization ID and email

## Email Domain Validation

The system validates email domains before proceeding with SSO:

1. Only specific domains are allowed to use SSO (configurable in `app/api/users/validate-email/route.ts`)
2. The default allowed domains include: 'company.com', 'workos.com', 'esprit.tn'
3. Users with unrecognized domains will receive an error message

## Testing SSO Integration

1. Ensure the backend server is running on port 4000
2. Start your development server
3. Click "Sign in with SSO" in the navigation menu
4. Enter a work email address with an allowed domain (e.g., user@company.com)
5. Click "Continue with SSO"
6. The system will validate the email domain
7. If valid, the backend will initiate the SSO flow with WorkOS
8. After successful authentication, you'll be redirected to the dashboard

## Components Overview

The SSO integration in the frontend uses the following components:

- `components/header.tsx` - Contains the "Sign in with SSO" button that links to the SSO page
- `app/auth/sso/page.tsx` - Dedicated page for SSO sign-in that collects and validates the user's email
- `app/api/users/validate-email/route.ts` - API route that validates email domains for SSO

## Authentication Flow

1. User clicks "Sign in with SSO" in the header
2. User is taken to the SSO page (`/auth/sso`) and enters their work email
3. Frontend validates the email format locally
4. Frontend sends email to `/api/users/validate-email` for domain validation
5. If domain is valid, user is redirected to the backend SSO endpoint
6. Backend initiates the SSO flow with WorkOS
7. WorkOS authenticates the user with the appropriate identity provider
8. After successful authentication, user is redirected to the dashboard

## Customizing Allowed Domains

To modify the list of domains allowed to use SSO:

1. Edit `app/api/users/validate-email/route.ts`
2. Update the `ALLOWED_SSO_DOMAINS` array with your approved domains:

```javascript
const ALLOWED_SSO_DOMAINS = [
  'yourcompany.com',
  'partner.com',
  // Add more allowed domains as needed
];
```

## Troubleshooting

If you encounter issues with the SSO integration:

1. Verify that the backend server is running on port 4000
2. Check that your environment variables are correctly set
3. Ensure the backend server has the correct WorkOS API key and client ID
4. Check the browser console and server logs for error messages
5. Verify that the organization ID is valid
6. If getting domain errors, check that your email domain is in the allowed list 