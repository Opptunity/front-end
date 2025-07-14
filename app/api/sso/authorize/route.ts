// This file is no longer needed as we're using an external backend service for SSO authorization.
// The SSO authorization is now handled by the backend service running on port 4000.

import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';

export async function GET(request: NextRequest) {
  try {
    // Get email domain from the request URL
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Create the WorkOS client
    const workos = new WorkOS(process.env.WORKOS_API_KEY || '');
    const clientId = process.env.WORKOS_CLIENT_ID;
    
    if (!clientId) {
      return NextResponse.json({ error: 'WorkOS Client ID is not configured' }, { status: 500 });
    }
    
    // Create the callback URL (must match what's configured in WorkOS dashboard)
    const redirectUri = `${request.nextUrl.origin}/auth/sso-callback`;
    
    // Get authorization URL for SSO
    const authorizationURL = workos.sso.getAuthorizationUrl({
      // Use domain parameter instead of organization
      domain: process.env.WORKOS_ORGANIZATION_DOMAIN,
      redirectUri,
      clientId: clientId,
    });
    
    return NextResponse.json({ authorizationURL });
  } catch (error) {
    console.error("Error initializing SSO:", error);
    return NextResponse.json({ error: "Failed to initialize SSO" }, { status: 500 });
  }
} 