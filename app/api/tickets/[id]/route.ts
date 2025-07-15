import { NextRequest, NextResponse } from 'next/server'
import { getTicketById, updateTicket, deleteTicket } from '@/lib/tickets-local'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await getTicketById(params.id)

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error in GET /api/tickets/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const ticket = await updateTicket(params.id, body)

    if (!ticket) {
      return NextResponse.json(
        { error: 'Ticket not found or update failed' },
        { status: 404 }
      )
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error in PUT /api/tickets/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteTicket(params.id)

    if (!success) {
      return NextResponse.json(
        { error: 'Ticket not found or delete failed' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/tickets/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 