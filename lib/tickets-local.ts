export type Priority = "Critical" | "High" | "Medium" | "Low"
export type Status = "Open" | "In Progress" | "Completed" | "Closed"

export interface Ticket {
  id: string;
  user_id: string;
  specification: string;
  description?: string;
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string;
  jiraKey?: string;
  // GroqCloud summary fields
  position_title?: string;
  client_name?: string;
  client_company?: string;
  seniority?: string;
  required_skills?: string[];
  contract_type?: string;
  duration?: string;
  experience?: string;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  rate_type?: string;
  work_arrangement?: string;
  work_location?: string;
  client_email?: string;
  client_phone?: string;
  start_date?: string;
  responsibilities?: string[];
  preferred_qualifications?: string[];
  benefits?: string[];
  application_process?: string;
  red_flags?: string[];
  summary_sentence?: string;
}

export interface CreateTicketData {
  specification: string;
  description?: string;
  priority: Priority;
  jiraKey?: string;
  // GroqCloud summary fields
  position_title?: string;
  client_name?: string;
  client_company?: string;
  seniority?: string;
  required_skills?: string[];
  contract_type?: string;
  duration?: string;
  experience?: string;
  budget_min?: number;
  budget_max?: number;
  currency?: string;
  rate_type?: string;
  work_arrangement?: string;
  work_location?: string;
  client_email?: string;
  client_phone?: string;
  start_date?: string;
  responsibilities?: string[];
  preferred_qualifications?: string[];
  benefits?: string[];
  application_process?: string;
  red_flags?: string[];
  summary_sentence?: string;
}

// Generate a simple ID
const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

// Get current user ID (mock for testing)
const getCurrentUserId = () => {
  return 'test-user-' + Date.now()
}

// Get tickets from localStorage
export function getTicketsFromStorage(): Ticket[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem('tickets')
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading tickets from localStorage:', error)
    return []
  }
}

// Save tickets to localStorage
const saveTicketsToStorage = (tickets: Ticket[]) => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem('tickets', JSON.stringify(tickets))
  } catch (error) {
    console.error('Error saving tickets to localStorage:', error)
  }
}

// Create a new ticket
export async function createTicket(ticketData: CreateTicketData): Promise<Ticket | null> {
  try {
    const newTicket: Ticket = {
      id: generateId(),
      user_id: getCurrentUserId(),
      specification: ticketData.specification,
      description: ticketData.description,
      priority: ticketData.priority,
      status: 'Open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      jiraKey: ticketData.jiraKey,
      // GroqCloud summary fields
      position_title: ticketData.position_title,
      client_name: ticketData.client_name,
      client_company: ticketData.client_company,
      seniority: ticketData.seniority,
      required_skills: ticketData.required_skills,
      contract_type: ticketData.contract_type,
      duration: ticketData.duration,
      experience: ticketData.experience,
      budget_min: ticketData.budget_min,
      budget_max: ticketData.budget_max,
      currency: ticketData.currency,
      rate_type: ticketData.rate_type,
      work_arrangement: ticketData.work_arrangement,
      work_location: ticketData.work_location,
      client_email: ticketData.client_email,
      client_phone: ticketData.client_phone,
      start_date: ticketData.start_date,
      responsibilities: ticketData.responsibilities,
      preferred_qualifications: ticketData.preferred_qualifications,
      benefits: ticketData.benefits,
      application_process: ticketData.application_process,
      red_flags: ticketData.red_flags,
      summary_sentence: ticketData.summary_sentence,
    }

    const tickets = getTicketsFromStorage()
    tickets.push(newTicket)
    saveTicketsToStorage(tickets)

    return newTicket
  } catch (error) {
    console.error('Error in createTicket:', error)
    return null
  }
}

// Get all tickets for the current user
export async function getUserTickets(): Promise<Ticket[]> {
  try {
    const tickets = getTicketsFromStorage()
    // For testing, return all tickets (in real app, filter by user_id)
    return tickets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } catch (error) {
    console.error('Error in getUserTickets:', error)
    return []
  }
}

// Get a specific ticket by ID
export async function getTicketById(ticketId: string): Promise<Ticket | null> {
  try {
    const tickets = getTicketsFromStorage()
    return tickets.find(ticket => ticket.id === ticketId) || null
  } catch (error) {
    console.error('Error in getTicketById:', error)
    return null
  }
}

// Update a ticket
export async function updateTicket(ticketId: string, updates: Partial<Ticket>): Promise<Ticket | null> {
  try {
    const tickets = getTicketsFromStorage()
    const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId)
    
    if (ticketIndex === -1) return null

    tickets[ticketIndex] = {
      ...tickets[ticketIndex],
      ...updates,
      updated_at: new Date().toISOString()
    }

    saveTicketsToStorage(tickets)
    return tickets[ticketIndex]
  } catch (error) {
    console.error('Error in updateTicket:', error)
    return null
  }
}

// Delete a ticket
export async function deleteTicket(ticketId: string): Promise<boolean> {
  try {
    const tickets = getTicketsFromStorage()
    const filteredTickets = tickets.filter(ticket => ticket.id !== ticketId)
    
    if (filteredTickets.length === tickets.length) return false

    saveTicketsToStorage(filteredTickets)
    return true
  } catch (error) {
    console.error('Error in deleteTicket:', error)
    return false
  }
}

// Clear all tickets (for testing)
export function clearAllTickets() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('tickets')
} 