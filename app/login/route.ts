import { getSignInUrl } from '@workos-inc/authkit-nextjs';
import { redirect } from 'next/navigation';

export const GET = async () => {
  try {
    // Get the authentication URL from WorkOS AuthKit
    const signInUrl = await getSignInUrl();
    
    // Redirect to the WorkOS hosted authentication page
    return redirect(signInUrl);
  } catch (error) {
    console.error('Error generating sign-in URL:', error);
    
    // Fallback to default SSO page on error
    return redirect('/auth/sso');
  }
}; 