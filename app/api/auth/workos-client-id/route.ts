import { NextRequest, NextResponse } from 'next/server';
import { getWorkOS } from '@workos-inc/authkit-nextjs';

export async function GET(request: NextRequest) {
  try {
    // Make sure we have a WorkOS client ID in the environment
    const clientId = process.env.WORKOS_CLIENT_ID;
    
    if (!clientId) {
      console.error('WorkOS client ID not configured in environment');
      return NextResponse.json(
        { error: 'WorkOS client ID not configured' },
        { status: 500 }
      );
    }
    
    // Return the client ID to the client-side code
    return NextResponse.json({ clientId }, { status: 200 });
  } catch (error) {
    console.error('Error getting WorkOS client ID:', error);
    return NextResponse.json(
      { error: 'Could not retrieve WorkOS client ID' },
      { status: 500 }
    );
  }
}

// Get access token for debugging
export async function POST(request: NextRequest) {
  try {
    // Get client credentials
    const workos = getWorkOS();
    
    // Get authkit cookie
    const authkitCookie = request.cookies.get('authkit');
    
    if (!authkitCookie?.value) {
      return NextResponse.json({ error: 'No authkit cookie found' }, { status: 400 });
    }
    
    // Return the authkit cookie value for debugging
    return NextResponse.json({ 
      authkitCookie: authkitCookie.value,
    }, { status: 200 });
  } catch (error) {
    console.error('Error getting authkit cookie:', error);
    return NextResponse.json(
      { error: 'Could not retrieve authkit cookie' },
      { status: 500 }
    );
  }
} 