import { supabase } from './supabase'

export type Priority = "Critical" | "High" | "Medium" | "Low"
export type Status = "Open" | "In Progress" | "Completed" | "Closed"

export interface Ticket {
  id: string
  user_id: string
  specification: string
  priority: Priority
  status: Status
  created_at: string
  updated_at: string
}

export interface CreateTicketData {
  specification: string
  priority: Priority
}

// Create a new ticket
export async function createTicket(ticketData: CreateTicketData): Promise<Ticket | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        specification: ticketData.specification,
        priority: ticketData.priority,
        status: 'Open'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating ticket:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in createTicket:', error)
    return null
  }
}

// Get all tickets for the current user
export async function getUserTickets(): Promise<Ticket[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tickets:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserTickets:', error)
    return []
  }
}

// Get a specific ticket by ID
export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching ticket:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getTicketById:', error)
    return null
  }
}

// Update a ticket
export async function updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { data, error } = await supabase
      .from('tickets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating ticket:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in updateTicket:', error)
    return null
  }
}

// Delete a ticket
export async function deleteTicket(ticketId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting ticket:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('Error in deleteTicket:', error)
    return false
  }
} 