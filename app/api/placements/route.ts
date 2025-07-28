import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ticketId = searchParams.get('ticket_id');
    const profilerId = searchParams.get('profiler_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('placements')
      .select(`
        *,
        profilers (
          id,
          first_name,
          last_name,
          email,
          phone,
          availability_status,
          skills,
          experience_level,
          location
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (ticketId) {
      query = query.eq('ticket_id', ticketId);
    }

    if (profilerId) {
      query = query.eq('profiler_id', profilerId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching placements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('placements')
      .select('*', { count: 'exact', head: true });

    // Apply the same filters for count
    if (ticketId) {
      countQuery = countQuery.eq('ticket_id', ticketId);
    }

    if (profilerId) {
      countQuery = countQuery.eq('profiler_id', profilerId);
    }

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count: totalCount } = await countQuery;

    return NextResponse.json({
      placements: data,
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
      ticket_id,
      profiler_id,
      assigned_by,
      status = 'proposed',
      notes,
      interview_scheduled_at,
      start_date,
      end_date,
      placement_fee
    } = body;

    // Validate required fields
    if (!ticket_id || !profiler_id) {
      return NextResponse.json({ 
        error: 'Ticket ID and Profiler ID are required' 
      }, { status: 400 });
    }

    // Check if ticket exists
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .select('id, required_skills, preferred_skills')
      .eq('id', ticket_id)
      .single();

    if (ticketError || !ticket) {
      return NextResponse.json({ 
        error: 'Invalid ticket ID' 
      }, { status: 400 });
    }

    // Check if profiler exists
    const { data: profiler, error: profilerError } = await supabase
      .from('profilers')
      .select('id, skills')
      .eq('id', profiler_id)
      .single();

    if (profilerError || !profiler) {
      return NextResponse.json({ 
        error: 'Invalid profiler ID' 
      }, { status: 400 });
    }

    // Check if placement already exists for this ticket-profiler combination
    const { data: existingPlacement } = await supabase
      .from('placements')
      .select('id')
      .eq('ticket_id', ticket_id)
      .eq('profiler_id', profiler_id)
      .single();

    if (existingPlacement) {
      return NextResponse.json({ 
        error: 'Placement already exists for this ticket-profiler combination' 
      }, { status: 409 });
    }

    // Use a default match score since we now use AI matching
    // The actual AI match score will be calculated separately
    const match_score = 0.75; // Default placeholder score

    const { data, error } = await supabase
      .from('placements')
      .insert({
        ticket_id,
        profiler_id,
        assigned_by,
        status,
        match_score,
        notes,
        interview_scheduled_at,
        start_date,
        end_date,
        placement_fee
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating placement:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log placement history
    await supabase
      .from('placement_history')
      .insert({
        placement_id: data.id,
        status_changed_to: status,
        changed_by: assigned_by,
        notes: 'Placement created'
      });

    return NextResponse.json({ placement: data }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 