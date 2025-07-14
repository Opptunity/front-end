import { handleAuth } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// Handle authentication callback from WorkOS with custom handling
export const GET = async (request: NextRequest) => {
  console.log('Auth callback: Processing authentication');
  
  try {
    return await handleAuth({
      returnPathname: '/dashboard',
      onSuccess: async (data) => {
        console.log('Auth callback: SUCCESS - Creating new session for:', data.user.email);
        
        // User authentication successful - new session created
        try {
          // Your existing user sync logic...
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
          const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
          
          if (supabaseUrl && supabaseAnonKey) {
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            
            const { data: existingUser, error: findError } = await supabase
              .from('Users')
              .select('*')
              .eq('email', data.user.email)
              .single();
            
            if (findError && findError.code !== 'PGRST116') {
              console.error('Error finding user:', findError);
            } else if (!existingUser) {
              console.log('Creating new user in database');
              await supabase
                .from('Users')
                .insert([{
                  email: data.user.email,
                  username: data.user.firstName ? 
                    (data.user.lastName ? `${data.user.firstName} ${data.user.lastName}` : data.user.firstName) : 
                    data.user.email.split('@')[0],
                  role: 'jobSeeker',
                  jobTitle: ''
                }]);
            }
          }
        } catch (syncError) {
          console.error('User sync error (non-critical):', syncError);
        }
        
        console.log('Auth callback: Session created successfully');
        return;
      },
      onError: async (error) => {
        console.error('Auth callback: ERROR occurred:', error);
        
        // Redirect to login with error message
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('error', 'authentication_failed');
        
        return NextResponse.redirect(loginUrl);
      }
    })(request);
  } catch (error) {
    console.error('Auth callback: Outer error:', error);
    
    // Fallback redirect to login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'callback_failed');
    
    return NextResponse.redirect(loginUrl);
  }
}; 