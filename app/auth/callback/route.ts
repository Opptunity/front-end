import { handleAuth } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';

// Handle authentication callback from WorkOS with custom handling
export const GET = handleAuth({
  returnPathname: '/dashboard',
  onSuccess: async (data) => {
    try {
      const user = data.user;
      // Log successful authentication with WorkOS
      console.log('WorkOS authentication successful:', user.email);
      
      try {
        // Try to login the user with our backend API - using a new approach with direct access
        // Since we're in a server component, we'll use Node.js's global fetch which we can control better
        
        console.log('Attempting to login user at: /api/users/login');
        
        // Implement direct database call instead of API call
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        
        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Missing Supabase environment variables');
        }
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Try to find the user in the database
        const { data: existingUser, error: findError } = await supabase
          .from('Users')
          .select('*')
          .eq('email', user.email)
          .single();
        
        if (findError && findError.code !== 'PGRST116') {
          // Error other than "not found"
          console.error('Error finding user:', findError);
          return;
        }
        
        // If user exists, we're done
        if (existingUser) {
          console.log('User found in database:', existingUser);
          return;
        }
        
        // If user doesn't exist, register them
        console.log('User not found, registering:', user.email);
        
        const { data: newUser, error: insertError } = await supabase
          .from('Users')
          .insert([
            { 
          email: user.email,
              username: user.firstName ? 
                (user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName) : 
                user.email.split('@')[0],
              role: 'jobSeeker',
              jobTitle: ''
            }
          ])
          .select()
          .single();
      
        if (insertError) {
          console.error('Error registering user:', insertError);
          return;
        }
        
        console.log('User registered successfully:', newUser);
        
      } catch (apiError) {
        console.error('Error with API calls:', apiError);
      }
      
      return;
    } catch (error) {
      console.error('Error during authentication:', error);
      return;
    }
  }
}); 