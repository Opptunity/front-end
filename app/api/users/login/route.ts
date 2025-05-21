import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('Users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error finding user:', error);
      
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ error: 'Error finding user' }, { status: 500 });
    }

    // Return user data (successful login)
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Unexpected error in login:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
