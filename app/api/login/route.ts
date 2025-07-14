import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { NextResponse } from 'next/server';

export const GET = async () => {
  console.log('Login route: Starting fresh authentication');
  
  try {
    // Force fresh authentication by calling WorkOS directly
    // This bypasses any existing session checks
    const signInUrl = await getSignInUrl();
    
    console.log('Generated fresh sign-in URL');
    
    const response = NextResponse.redirect(signInUrl);
    
    // Clear any auth cookies
    response.cookies.set('authkit', '', { expires: new Date(0), path: '/' });
    
    return response;
  } catch (error) {
    console.error('Error generating sign-in URL:', error);
    
    // Fallback to SSO route
    return NextResponse.redirect('/auth/sso?fresh=true');
  }
}; 