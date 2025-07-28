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
      .from('placements')
      .select(`
        *,
        tickets:ticket_id(
          id,
          ticket_number,
          position_title,
          company_name,
          status,
          required_skills,
          preferred_skills,
          priority,
          start_date,
          end_date,
          budget_min,
          budget_max
        ),
        profilers:profiler_id(
          id,
          first_name,
          last_name,
          email,
          phone,
          availability_status,
          skills,
          experience_level,
          location,
          hourly_rate,
          daily_rate
        ),
        assigned_by_user:assigned_by(
          id,
          email,
          username
        ),
        placement_history(
          id,
          status_changed_to,
          reason,
          notes,
          created_at,
          changed_by_user:changed_by(
            id,
            email,
            username
          )
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Placement not found' }, { status: 404 });
      }
      console.error('Error fetching placement:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ placement: data });

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

    // Get current placement to track status changes
    const { data: currentPlacement } = await supabase
      .from('placements')
      .select('status')
      .eq('id', params.id)
      .single();

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('placements')
      .update(updateData)
      .eq('id', params.id)
      .select(`
        *,
        tickets:ticket_id(
          id,
          ticket_number,
          position_title,
          company_name
        ),
        profilers:profiler_id(
          id,
          first_name,
          last_name,
          email
        )
      `)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Placement not found' }, { status: 404 });
      }
      console.error('Error updating placement:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log status change if status was updated
    if (updateData.status && currentPlacement && currentPlacement.status !== updateData.status) {
      await supabase
        .from('placement_history')
        .insert({
          placement_id: params.id,
          status_changed_to: updateData.status,
          changed_by: updateData.assigned_by || null,
          reason: updateData.status_change_reason || null,
          notes: `Status changed from ${currentPlacement.status} to ${updateData.status}`
        });
    }

    return NextResponse.json({ placement: data });

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
    // Get placement info before deletion for logging
    const { data: placement } = await supabase
      .from('placements')
      .select('id, ticket_id, profiler_id, status')
      .eq('id', params.id)
      .single();

    const { error } = await supabase
      .from('placements')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Error deleting placement:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Placement deleted successfully',
      deletedPlacement: placement
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 