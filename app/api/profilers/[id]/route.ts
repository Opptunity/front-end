import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('profilers')
      .select(`
        *,
        placements:placements(
          id,
          ticket_id,
          status,
          match_score,
          start_date,
          end_date,
          created_at,
          tickets:ticket_id(
            ticket_number,
            position_title,
            company_name,
            status
          )
        ),
        availability_calendar(
          id,
          start_date,
          end_date,
          status,
          notes
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profiler not found' }, { status: 404 });
      }
      console.error('Error fetching profiler:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiler: data });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Remove id from update data if present
    const { id: _, ...updateData } = body;

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profilers')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Profiler not found' }, { status: 404 });
      }
      console.error('Error updating profiler:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ profiler: data });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('profilers')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting profiler:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profiler deleted successfully' });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 