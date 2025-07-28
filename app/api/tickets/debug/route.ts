import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function GET(request: NextRequest) {
  try {
    // Get raw ticket data from database
    const { data: rawTickets, error } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .limit(5);

    if (error) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }

    // Get total count
    const { count } = await supabaseAdmin
      .from('tickets')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      total_tickets: count,
      sample_tickets: rawTickets,
      message: 'Raw database data for debugging'
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
} 