import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, username, role, jobTitle } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user already exists
    const { data: existingUser, error: findError } = await supabase
      .from('Users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is what we want
      console.error('Error checking existing user:', findError);
      return NextResponse.json({ error: 'Error checking user' }, { status: 500 });
    }

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('Users')
      .insert([
        { 
          email, 
          username: username || email.split('@')[0], 
          role: role || 'jobSeeker',
          jobTitle: jobTitle || ''
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Unexpected error in registration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 