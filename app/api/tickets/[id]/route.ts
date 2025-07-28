import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key for API routes
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params

    console.log('Fetching ticket details for ID:', ticketId)

    // Fetch the ticket by ID
    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch ticket', 
        details: error.message 
      }, { status: 500 })
    }

    if (!ticket) {
      return NextResponse.json({ 
        error: 'Ticket not found' 
      }, { status: 404 })
    }

    console.log('Ticket found:', ticket.ticket_number)

    return NextResponse.json({ 
      ticket,
      success: true 
    })

  } catch (error) {
    console.error('Error in ticket fetch API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params
    const updateData = await request.json()

    console.log('Updating ticket:', ticketId)

    // Update the ticket
    const { data: ticket, error } = await supabaseAdmin
      .from('tickets')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      return NextResponse.json({ 
        error: 'Failed to update ticket', 
        details: error.message 
      }, { status: 500 })
    }

    if (!ticket) {
      return NextResponse.json({ 
        error: 'Ticket not found' 
      }, { status: 404 })
    }

    console.log('Ticket updated successfully:', ticket.ticket_number)

    return NextResponse.json({ 
      ticket,
      success: true,
      message: 'Ticket updated successfully'
    })

  } catch (error) {
    console.error('Error in ticket update API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params

    console.log('Deleting ticket:', ticketId)

    // Delete the ticket
    const { error } = await supabaseAdmin
      .from('tickets')
      .delete()
      .eq('id', ticketId)

    if (error) {
      console.error('Error deleting ticket:', error)
      return NextResponse.json({ 
        error: 'Failed to delete ticket', 
        details: error.message 
      }, { status: 500 })
    }

    console.log('Ticket deleted successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Ticket deleted successfully'
    })

  } catch (error) {
    console.error('Error in ticket delete API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 