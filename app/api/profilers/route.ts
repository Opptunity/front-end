import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const skills = searchParams.get('skills');
    const availability = searchParams.get('availability');
    const location = searchParams.get('location');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('profilers')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (availability) {
      query = query.eq('availability_status', availability);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      // Search for any of the skills in the JSONB array
      const skillQueries = skillArray.map(skill => 
        `skills.cs.${JSON.stringify([{name: skill}])}`
      );
      query = query.or(skillQueries.join(','));
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching profilers:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('profilers')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      profilers: data,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0)
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      email,
      first_name,
      last_name,
      phone,
      location,
      availability_status = 'available',
      preferred_work_arrangement = [],
      skills = [],
      experience_level,
      years_of_experience,
      hourly_rate,
      daily_rate,
      currency = 'USD',
      bio,
      linkedin_url,
      portfolio_url,
      resume_url,
      certifications = [],
      languages = [],
      preferred_industries = [],
      contract_types = [],
      notice_period_days = 0
    } = body;

    // Validate required fields
    if (!email || !first_name || !last_name) {
      return NextResponse.json({ 
        error: 'Email, first name, and last name are required' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }

    // Check if profiler already exists
    const { data: existingProfiler } = await supabase
      .from('profilers')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfiler) {
      return NextResponse.json({ 
        error: 'Profiler with this email already exists' 
      }, { status: 409 });
    }

    const { data, error } = await supabase
      .from('profilers')
      .insert({
        email,
        first_name,
        last_name,
        phone,
        location,
        availability_status,
        preferred_work_arrangement,
        skills,
        experience_level,
        years_of_experience,
        hourly_rate,
        daily_rate,
        currency,
        bio,
        linkedin_url,
        portfolio_url,
        resume_url,
        certifications,
        languages,
        preferred_industries,
        contract_types,
        notice_period_days
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profiler:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiler: data }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 