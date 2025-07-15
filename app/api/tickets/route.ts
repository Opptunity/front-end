import { NextRequest, NextResponse } from 'next/server'
import { createTicket, getUserTickets } from '@/lib/tickets-local'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { specification, priority } = body

    if (!specification) {
      return NextResponse.json(
        { error: 'Specification is required' },
        { status: 400 }
      )
    }

    const ticket = await createTicket({
      specification,
      priority: priority || 'Medium'
    })

    if (!ticket) {
      return NextResponse.json(
        { error: 'Failed to create ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tickets = await getUserTickets()
    return NextResponse.json(tickets)
  } catch (error) {
    console.error('Error in GET /api/tickets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 