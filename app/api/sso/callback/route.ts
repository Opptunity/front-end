import { NextRequest, NextResponse } from 'next/server';
import { WorkOS } from '@workos-inc/node';
import jwt from 'jsonwebtoken';

// JWT secret for creating auth tokens
// In production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();
    
    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }
    
    // Create WorkOS client
    const workos = new WorkOS(process.env.WORKOS_API_KEY || '');
    const clientId = process.env.WORKOS_CLIENT_ID;
    
    if (!clientId) {
      return NextResponse.json({ error: 'WorkOS Client ID is not configured' }, { status: 500 });
    }
    
    // Create the callback URL (must match what's configured in WorkOS dashboard)
    const redirectUri = `${request.nextUrl.origin}/auth/sso-callback`;
    
    // Get the user profile from WorkOS
    const { profile, organization } = await workos.sso.getProfileAndToken({
      code,
      clientId,
    });
    
    // Create a user in your database or retrieve existing user
    // For this example, we'll just use the profile data directly
    
    // Create a JWT token for the authenticated user
    const token = jwt.sign(
      { 
        sub: profile.id,
        email: profile.email,
        name: profile.firstName && profile.lastName 
          ? `${profile.firstName} ${profile.lastName}`
          : profile.email,
        organization: organization?.id || '',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    return NextResponse.json({ 
      token,
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.firstName && profile.lastName 
          ? `${profile.firstName} ${profile.lastName}`
          : profile.email,
      }
    });
  } catch (error) {
    console.error("SSO callback error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
} 