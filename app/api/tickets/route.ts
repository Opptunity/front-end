import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { syncJiraTickets, syncAndCleanupJiraTickets } from '@/lib/jira-sync-service'

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

export async function POST(request: NextRequest) {
  try {
    const ticketData = await request.json()
    
    // Generate ticket number if not provided
    const ticketNumber = ticketData.ticketNumber || `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Prepare the ticket data for database storage
    const ticketToStore = {
      ticket_number: ticketNumber,
      created_by: ticketData.createdBy,
      status: ticketData.status || 'pending',
      priority: ticketData.priority,
      
      // Client Information
      client_name: ticketData.clientName,
      client_company: ticketData.clientCompany,
      client_email: ticketData.clientEmail,
      client_phone: ticketData.clientPhone,
      
      // Position Details
      position_title: ticketData.positionTitle,
      department: ticketData.department,
      seniority: ticketData.seniority,
      contract_type: ticketData.contractType,
      duration: ticketData.duration,
      start_date: ticketData.startDate,
      work_location: ticketData.workLocation,
      work_arrangement: ticketData.workArrangement,
      
      // Requirements (JSON fields)
      required_skills: ticketData.requiredSkills,
      preferred_skills: ticketData.preferredSkills,
      experience: ticketData.experience,
      education: ticketData.education,
      certifications: ticketData.certifications,
      
      // Project Details
      project_description: ticketData.projectDescription,
      responsibilities: ticketData.responsibilities,
      
      // Budget & Terms
      budget_min: ticketData.budgetMin,
      budget_max: ticketData.budgetMax,
      currency: ticketData.currency || 'USD',
      rate_type: ticketData.rateType,
      
      // Additional Information
      urgency: ticketData.urgency,
      special_requirements: ticketData.specialRequirements,
      notes: ticketData.notes,
      
      // Timestamps
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    console.log('Storing ticket in database:', ticketNumber)
    
    // Insert the ticket into Supabase using admin client
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .insert(ticketToStore)
      .select()
      .single()
    
    if (error) {
      console.error('Error storing ticket:', error)
      return NextResponse.json({ 
        error: 'Failed to store ticket', 
        details: error.message 
      }, { status: 500 })
    }
    
    console.log('Ticket stored successfully:', data.id)
    
    return NextResponse.json({
      success: true,
      ticketId: data.id,
      ticketNumber: ticketNumber,
      message: 'Ticket created and stored successfully'
    })
    
  } catch (error) {
    console.error('Error in ticket creation API:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: (error as any).message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const createdBy = searchParams.get('created_by')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')
    const includeJira = searchParams.get('include_jira') !== 'false' // Default to true
    
    // Build database query for both local and JIRA tickets
    let query = supabaseAdmin
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })
    
    // Filter by creator if provided (only applies to local tickets)
    if (createdBy) {
      query = query.eq('created_by', createdBy).eq('source', 'local')
    } else if (!includeJira) {
      // If JIRA is disabled, only fetch local tickets
      query = query.eq('source', 'local')
    }
    // If no creator filter and JIRA is enabled, fetch both local and JIRA tickets
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    
    // Filter by priority if provided
    if (priority && priority !== 'all') {
      query = query.eq('priority', priority)
    }
    
    // Search across multiple fields if provided
    if (search) {
      query = query.or(`position_title.ilike.%${search}%,client_company.ilike.%${search}%,client_name.ilike.%${search}%,ticket_number.ilike.%${search}%,company_name.ilike.%${search}%,contact_name.ilike.%${search}%`)
    }
    
    const { data: tickets, error } = await query
    
    if (error) {
      console.error('Error fetching tickets:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch tickets', 
        details: (error as any).message 
      }, { status: 500 })
    }

    // Fetch placements separately to avoid foreign key relationship issues
    const ticketIds = (tickets || []).map(ticket => ticket.id)
    let placements: any[] = []
    
    if (ticketIds.length > 0) {
      const { data: placementsData, error: placementsError } = await supabaseAdmin
        .from('placements')
        .select('id, ticket_id, status, profiler_id, created_at')
        .in('ticket_id', ticketIds)
      
      if (placementsError) {
        console.error('Error fetching placements:', placementsError)
        // Don't fail the entire request if placements fetch fails
        placements = []
      } else {
        placements = placementsData || []
      }
    }

    // Auto-sync JIRA tickets if this is for delivery manager and JIRA is enabled
    if (includeJira && !createdBy) {
      try {
        console.log('Triggering JIRA sync and cleanup...')
        // Run a quick sync with cleanup (limited results) to get latest tickets and remove deleted ones
        await syncAndCleanupJiraTickets({ maxResults: 50 })
        console.log('JIRA sync and cleanup completed')
      } catch (jiraError) {
        console.error('Error syncing JIRA tickets:', jiraError)
        // Don't fail the entire request if JIRA sync fails
        // Just log the error and continue with existing database tickets
      }
    }
    
        // Check if this is for delivery manager (no created_by filter)
    const isDeliveryManager = !createdBy;
    
    if (isDeliveryManager) {
      // Transform tickets for delivery manager format
      const transformedTickets = (tickets || []).map((ticket: any) => {
        // Find placements for this ticket
        const ticketPlacements = placements.filter(p => p.ticket_id === ticket.id)
        
        return {
          id: ticket.id,
          ticket_number: ticket.ticket_number,
          company_name: ticket.client_company || ticket.company_name,
          contact_name: ticket.client_name || ticket.contact_name,
          contact_email: ticket.client_email || ticket.contact_email,
          contact_phone: ticket.client_phone || ticket.contact_phone,
          position_title: ticket.position_title,
          status: ticket.status,
          priority: ticket.priority,
          required_skills: ticket.required_skills || [],
          preferred_skills: ticket.preferred_skills || [],
          experience_level: ticket.experience,
          location: ticket.work_location || ticket.location,
          work_arrangement: ticket.work_arrangement,
          contract_type: ticket.contract_type,
          start_date: ticket.start_date,
          end_date: ticket.end_date,
          budget_min: ticket.budget_min,
          budget_max: ticket.budget_max,
          currency: ticket.currency,
          project_description: ticket.project_description,
          special_requirements: ticket.special_requirements,
          responsibilities: ticket.responsibilities || [],
          education_requirements: ticket.education,
          certifications_required: ticket.certifications_required || [],
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          assigned_to: ticket.assigned_to,
          created_by_user: {
            email: ticket.created_by,
            username: ticket.created_by
          },
          source: ticket.source || 'local',
          jira_key: ticket.jira_key,
          jira_project: ticket.jira_project,
          placements: ticketPlacements,
          has_placements: ticketPlacements.length > 0
        }
      });

      // Separate local and JIRA tickets for counting
      const localCount = transformedTickets.filter((t: any) => t.source === 'local').length;
      const jiraCount = transformedTickets.filter((t: any) => t.source === 'jira').length;

      return NextResponse.json({
        tickets: transformedTickets,
        total: transformedTickets.length,
        local_count: localCount,
        jira_count: jiraCount
      });
    } else {
      // Format the tickets for my-tickets page (original format, local tickets only)
      const formattedTickets = (tickets || []).map((ticket: any) => ({
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        clientName: ticket.client_name,
        clientCompany: ticket.client_company,
        positionTitle: ticket.position_title,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        budgetRange: ticket.budget_min && ticket.budget_max 
          ? `${ticket.budget_min} - ${ticket.budget_max} ${ticket.currency || 'USD'}`
          : null
      }));

      return NextResponse.json(formattedTickets);
    }
    
  } catch (error) {
    console.error('Error in tickets fetch API:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: (error as any).message 
    }, { status: 500 })
  }
} 