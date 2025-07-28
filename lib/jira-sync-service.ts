// JIRA synchronization service - stores JIRA tickets in local database
import { createClient } from '@supabase/supabase-js'
import { fetchAllJiraIssues, type JiraIssue, type JiraConfig } from '@/lib/jira-service'
import { extractTicketFieldsFromDescription, type DatabaseTicketFields, type JiraDescriptionInput } from '@/lib/jira-ai-field-extractor'
import { extractTextFromJiraDescription } from '@/lib/jira-text-extractor'

// Create a Supabase client with service role key
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

// Interface for ticket data to be stored in database
interface DatabaseTicket {
  id?: string
  ticket_number: string
  created_by: string
  status: string
  priority: string
  
  // Client Information
  client_name: string // Required - must always be provided
  client_company: string // Required - must always be provided
  client_email: string // Required - must always be provided
  client_phone?: string
  
  // Position Details
  position_title: string
  department?: string | null
  seniority?: string | null
  contract_type?: string | null
  duration?: string | null
  start_date?: string
  end_date?: string
  work_location?: string | null
  work_arrangement?: string | null
  
  // Requirements
  required_skills?: any[] | null
  preferred_skills?: any[] | null
  experience?: string | null
  education?: string | null
  certifications?: string | null
  
  // Project Details
  project_description?: string | null
  responsibilities?: string | null
  
  // Budget & Terms
  budget_min?: number | null
  budget_max?: number | null
  currency?: string | null
  rate_type?: string | null
  
  // Additional Information
  urgency?: string | null
  special_requirements?: string | null
  notes?: string | null
  assigned_to?: string
  
  // JIRA-specific fields
  source: 'jira'
  jira_key: string
  jira_project: string
  jira_issue_id: string
  jira_url?: string
  jira_status?: string
  jira_priority?: string
  jira_last_sync: string
  
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Transform JIRA issue to database ticket format using AI-powered field extraction
 * 
 * CRITICAL: This function ensures that ALL business fields (client info, position details, 
 * requirements, budget, etc.) come from AI extraction ONLY. The JIRA API is only used for:
 * - Metadata tracking (jira_key, jira_status, etc.)
 * - System fields (ticket_number, created_by, timestamps)
 * - Status/priority mapping
 * 
 * This prevents JIRA's unstructured data from polluting our structured database.
 */
async function transformJiraIssueToDatabase(issue: JiraIssue, jiraConfig: any): Promise<DatabaseTicket> {
  console.log(`AI analyzing JIRA ticket: ${issue.key}`)
  
  // Map JIRA status to our application status
  const mapStatus = (jiraStatus: string): string => {
    const status = jiraStatus.toLowerCase()
    if (status.includes('to do') || status.includes('open') || status.includes('new') || status.includes('backlog')) return 'pending'
    if (status.includes('assigned') || status.includes('selected')) return 'in-review'
    if (status.includes('in progress') || status.includes('in development') || status.includes('in review')) return 'in-review'
    if (status.includes('blocked') || status.includes('hold') || status.includes('waiting')) return 'pending'
    if (status.includes('done') || status.includes('closed') || status.includes('resolved') || status.includes('complete')) return 'completed'
    if (status.includes('cancelled') || status.includes('rejected')) return 'cancelled'
    return 'pending'
  }

  // Map JIRA priority to our application priority
  const mapPriority = (jiraPriority?: string): string => {
    if (!jiraPriority) return 'medium'
    const priority = jiraPriority.toLowerCase()
    if (priority.includes('highest') || priority.includes('critical')) return 'urgent'
    if (priority.includes('high')) return 'high'
    if (priority.includes('low') || priority.includes('lowest')) return 'low'
    return 'medium'
  }

  // Extract plain text from JIRA description (handles both string and ADF object formats)
  const descriptionText = extractTextFromJiraDescription(issue.fields.description)
  
  console.log(`📝 Extracted description text for ${issue.key}:`, descriptionText ? `${descriptionText.substring(0, 100)}...` : 'No description')
  
  // Prepare simplified input - only description and summary for AI
  const aiInput: JiraDescriptionInput = {
    description: descriptionText,
    summary: issue.fields.summary // Optional fallback
  }

  // Use AI to extract structured database fields
  let aiFields: DatabaseTicketFields
  
  // Check if OpenAI is available
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  
  console.log(`🤖 OpenAI availability check for ${issue.key}:`, { hasOpenAI })
  
  if (!hasOpenAI) {
    console.warn(`⚠️ OpenAI API key not configured for ${issue.key}, using basic extraction`)
    aiFields = {
      position_title: issue.fields.summary || 'Untitled Position',
      project_description: descriptionText || 'No description provided',
      currency: 'USD',
      client_name: issue.fields.reporter?.displayName || 'Unknown Client',
      client_email: issue.fields.reporter?.emailAddress || 'unknown@client.com',
      client_company: issue.fields.project.name || 'Unknown Company'
    }
  } else {
    try {
      console.log(`🧠 Starting AI extraction for ${issue.key} (description only)...`)
      aiFields = await extractTicketFieldsFromDescription(aiInput)
      console.log(`✅ AI extraction successful for ${issue.key}:`, Object.keys(aiFields))
      console.log(`📊 AI extracted fields for ${issue.key}:`, JSON.stringify(aiFields, null, 2))
    } catch (error) {
      console.error(`❌ AI extraction failed for ${issue.key}, using fallback:`, error)
      // Fallback to basic extraction if AI fails
      aiFields = {
        position_title: issue.fields.summary || 'Untitled Position',
        project_description: descriptionText || 'No description provided',
        currency: 'USD',
        client_name: issue.fields.reporter?.displayName || 'Unknown Client',
        client_email: issue.fields.reporter?.emailAddress || 'unknown@client.com',
        client_company: issue.fields.project.name || 'Unknown Company'
      }
    }
  }

  const jiraUrl = `${jiraConfig.baseUrl}/browse/${issue.key}`

  // Build the database ticket using ONLY AI-extracted fields + minimal JIRA metadata
  const finalTicket = {
    // JIRA metadata fields (required for tracking)
    ticket_number: issue.key,
    created_by: issue.fields.reporter?.emailAddress || 'jira-sync@system.local',
    status: mapStatus(issue.fields.status.name),
    priority: mapPriority(issue.fields.priority?.name),
    
    // ALL business fields come from AI extraction ONLY
    ...aiFields,
    
    // Minimal JIRA metadata (only for tracking purposes)
    start_date: issue.fields.duedate,
    assigned_to: issue.fields.assignee?.emailAddress,
    
    // JIRA-specific tracking fields
    source: 'jira',
    jira_key: issue.key,
    jira_project: issue.fields.project.key,
    jira_issue_id: issue.id,
    jira_url: jiraUrl,
    jira_status: issue.fields.status.name,
    jira_priority: issue.fields.priority?.name,
    jira_last_sync: new Date().toISOString(),
    
    // Timestamps
    created_at: issue.fields.created,
    updated_at: issue.fields.updated
  }
  
  console.log(`🎯 Final ticket for ${issue.key}:`, JSON.stringify({
    client_name: finalTicket.client_name,
    client_company: finalTicket.client_company,
    client_email: finalTicket.client_email,
    work_location: finalTicket.work_location,
    position_title: finalTicket.position_title,
    project_description: finalTicket.project_description ? `${finalTicket.project_description.substring(0, 100)}...` : 'No description'
  }, null, 2))
  
  return finalTicket
}

/**
 * Check if a JIRA ticket already exists in the database
 */
async function getExistingJiraTicket(jiraKey: string): Promise<any | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('tickets')
      .select('id, jira_key, updated_at, jira_last_sync')
      .eq('jira_key', jiraKey)
      .eq('source', 'jira')
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing JIRA ticket:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error checking existing JIRA ticket:', error)
    return null
  }
}

/**
 * Insert a new JIRA ticket into the database
 */
async function insertJiraTicket(ticket: DatabaseTicket): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('tickets')
      .insert(ticket)

    if (error) {
      console.error('Error inserting JIRA ticket:', error)
      return false
    }

    console.log(`Inserted new JIRA ticket: ${ticket.jira_key}`)
    return true
  } catch (error) {
    console.error('Error inserting JIRA ticket:', error)
    return false
  }
}

/**
 * Update an existing JIRA ticket in the database
 */
async function updateJiraTicket(ticketId: string, ticket: Partial<DatabaseTicket>): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('tickets')
      .update({
        ...ticket,
        updated_at: new Date().toISOString()
      })
      .eq('id', ticketId)

    if (error) {
      console.error('Error updating JIRA ticket:', error)
      return false
    }

    console.log(`Updated JIRA ticket: ${ticket.jira_key}`)
    return true
  } catch (error) {
    console.error('Error updating JIRA ticket:', error)
    return false
  }
}

/**
 * Transform JIRA issue to database format WITHOUT AI extraction (for updates)
 * Only updates JIRA-specific fields, preserves AI-extracted data
 */
async function transformJiraIssueToDatabaseBasic(issue: JiraIssue, jiraConfig: any): Promise<Partial<DatabaseTicket>> {
  console.log(`Basic transformation for JIRA ticket: ${issue.key}`)
  
  // Map JIRA status to our application status
  const mapStatus = (jiraStatus: string): string => {
    const status = jiraStatus.toLowerCase()
    if (status.includes('to do') || status.includes('open') || status.includes('new') || status.includes('backlog')) return 'pending'
    if (status.includes('assigned') || status.includes('selected')) return 'in-review'
    if (status.includes('in progress') || status.includes('in development') || status.includes('in review')) return 'in-review'
    if (status.includes('blocked') || status.includes('hold') || status.includes('waiting')) return 'pending'
    if (status.includes('done') || status.includes('closed') || status.includes('resolved') || status.includes('complete')) return 'completed'
    if (status.includes('cancelled') || status.includes('rejected')) return 'cancelled'
    return 'pending'
  }

  // Map JIRA priority to our application priority
  const mapPriority = (jiraPriority?: string): string => {
    if (!jiraPriority) return 'medium'
    const priority = jiraPriority.toLowerCase()
    if (priority.includes('highest') || priority.includes('critical')) return 'urgent'
    if (priority.includes('high')) return 'high'
    if (priority.includes('low') || priority.includes('lowest')) return 'low'
    return 'medium'
  }

  const jiraUrl = `${jiraConfig.baseUrl}/browse/${issue.key}`

  // Only update JIRA-specific fields, preserve AI-extracted data
  return {
    // Only update these basic fields that might change in JIRA
    status: mapStatus(issue.fields.status.name),
    priority: mapPriority(issue.fields.priority?.name),
    assigned_to: issue.fields.assignee?.emailAddress,
    start_date: issue.fields.duedate,
    
    // JIRA-specific fields
    jira_status: issue.fields.status.name,
    jira_priority: issue.fields.priority?.name,
    jira_last_sync: new Date().toISOString(),
    
    // Timestamp
    updated_at: issue.fields.updated
  }
}

/**
 * Sync a single JIRA issue to the database
 */
async function syncJiraIssue(issue: JiraIssue, jiraConfig: any): Promise<boolean> {
  try {
    const existingTicket = await getExistingJiraTicket(issue.key)

    if (existingTicket) {
      // Check if the ticket needs updating
      const issueUpdated = new Date(issue.fields.updated)
      const lastSync = existingTicket.jira_last_sync ? new Date(existingTicket.jira_last_sync) : new Date(0)
      
      if (issueUpdated > lastSync) {
        // Update existing ticket - use basic transformation (no AI)
        console.log(`Updating existing JIRA ticket: ${issue.key} (no AI extraction)`)
        const basicTicket = await transformJiraIssueToDatabaseBasic(issue, jiraConfig)
        return await updateJiraTicket(existingTicket.id, basicTicket)
      } else {
        // No update needed
        console.log(`JIRA ticket ${issue.key} is up to date`)
        return true
      }
    } else {
      // Insert new ticket - use AI extraction
      console.log(`Inserting new JIRA ticket: ${issue.key} (with AI extraction)`)
      const transformedTicket = await transformJiraIssueToDatabase(issue, jiraConfig)
      return await insertJiraTicket(transformedTicket)
    }
  } catch (error) {
    console.error(`Error syncing JIRA issue ${issue.key}:`, error)
    return false
  }
}

/**
 * Sync all JIRA tickets to the database
 */
export async function syncJiraTickets(options: {
  maxResults?: number
  forceSync?: boolean
  cleanup?: boolean
} = {}): Promise<{ success: boolean; synced: number; errors: number; cleanup?: { success: boolean; deleted: number; errors: number } }> {
  const { maxResults = 100, forceSync = false, cleanup = false } = options
  
  console.log('Starting JIRA ticket synchronization...')
  
  try {
    // Get JIRA configuration
    const jiraConfig = {
      baseUrl: process.env.JIRA_BASE_URL,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_API_TOKEN,
      projectKeys: process.env.JIRA_PROJECT_KEYS?.split(',').map(key => key.trim())
    }

    if (!jiraConfig.baseUrl || !jiraConfig.email || !jiraConfig.apiToken) {
      console.error('JIRA configuration is missing')
      return { success: false, synced: 0, errors: 1 }
    }

    // Fetch JIRA issues
    const jiraIssues = await fetchAllJiraIssues({ maxResults })
    console.log(`Fetched ${jiraIssues.length} JIRA issues for sync`)

    let synced = 0
    let errors = 0

    // Sync each issue
    for (const issue of jiraIssues) {
      const success = await syncJiraIssue(issue, jiraConfig)
      if (success) {
        synced++
      } else {
        errors++
      }
    }

    console.log(`JIRA sync completed: ${synced} synced, ${errors} errors`)

    // Optionally run cleanup after sync
    let cleanupResult
    if (cleanup) {
      console.log('Running cleanup after sync...')
      cleanupResult = await cleanupDeletedJiraTickets()
      console.log(`Cleanup completed: ${cleanupResult.deleted} deleted, ${cleanupResult.errors} errors`)
    }

    return { 
      success: true, 
      synced, 
      errors,
      cleanup: cleanupResult
    }

  } catch (error) {
    console.error('Error during JIRA ticket synchronization:', error)
    return { success: false, synced: 0, errors: 1 }
  }
}

/**
 * Sync and cleanup JIRA tickets in one operation
 */
export async function syncAndCleanupJiraTickets(options: {
  maxResults?: number
  forceSync?: boolean
} = {}): Promise<{ success: boolean; synced: number; errors: number; cleanup: { success: boolean; deleted: number; errors: number } }> {
  return await syncJiraTickets({ ...options, cleanup: true })
}

/**
 * Sync specific JIRA projects
 */
export async function syncJiraProject(projectKey: string, maxResults: number = 50): Promise<{ success: boolean; synced: number; errors: number }> {
  console.log(`Starting JIRA sync for project: ${projectKey}`)
  
  try {
    const jiraConfig = {
      baseUrl: process.env.JIRA_BASE_URL,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_API_TOKEN
    }

    // Create a temporary config with just this project
    const tempConfig = { ...jiraConfig, projectKeys: [projectKey] }
    
    // Use the existing function but override project keys
    const originalProjectKeys = process.env.JIRA_PROJECT_KEYS
    process.env.JIRA_PROJECT_KEYS = projectKey
    
    const result = await syncJiraTickets({ maxResults })
    
    // Restore original project keys
    if (originalProjectKeys) {
      process.env.JIRA_PROJECT_KEYS = originalProjectKeys
    } else {
      delete process.env.JIRA_PROJECT_KEYS
    }
    
    return result
  } catch (error) {
    console.error(`Error syncing JIRA project ${projectKey}:`, error)
    return { success: false, synced: 0, errors: 1 }
  }
}

/**
 * Clean up JIRA tickets that no longer exist in JIRA
 */
export async function cleanupDeletedJiraTickets(): Promise<{ success: boolean; deleted: number; errors: number }> {
  console.log('Starting cleanup of deleted JIRA tickets...')
  
  try {
    // Get JIRA configuration
    const jiraConfig = {
      baseUrl: process.env.JIRA_BASE_URL,
      email: process.env.JIRA_EMAIL,
      apiToken: process.env.JIRA_API_TOKEN,
      projectKeys: process.env.JIRA_PROJECT_KEYS?.split(',').map(key => key.trim())
    }

    if (!jiraConfig.baseUrl || !jiraConfig.email || !jiraConfig.apiToken) {
      console.error('JIRA configuration is missing')
      return { success: false, deleted: 0, errors: 1 }
    }

    // Get all JIRA tickets from database
    const { data: dbTickets, error: dbError } = await supabaseAdmin
      .from('tickets')
      .select('id, jira_key, jira_project')
      .eq('source', 'jira')
      .not('jira_key', 'is', null)

    if (dbError) {
      console.error('Error fetching JIRA tickets from database:', dbError)
      return { success: false, deleted: 0, errors: 1 }
    }

    if (!dbTickets || dbTickets.length === 0) {
      console.log('No JIRA tickets found in database')
      return { success: true, deleted: 0, errors: 0 }
    }

    console.log(`Found ${dbTickets.length} JIRA tickets in database`)

    // Fetch all current JIRA issues
    const jiraIssues = await fetchAllJiraIssues({ maxResults: 1000 }) // Increased limit to get more tickets
    const currentJiraKeys = new Set(jiraIssues.map(issue => issue.key))
    
    console.log(`Found ${jiraIssues.length} current JIRA issues`)

    // Find tickets that exist in database but not in JIRA
    const ticketsToDelete = dbTickets.filter(ticket => !currentJiraKeys.has(ticket.jira_key))
    
    console.log(`Found ${ticketsToDelete.length} tickets to delete (no longer exist in JIRA)`)

    if (ticketsToDelete.length === 0) {
      console.log('No tickets need to be deleted')
      return { success: true, deleted: 0, errors: 0 }
    }

    const ticketIds = ticketsToDelete.map(t => t.id)
    
    // First, delete related placements to avoid foreign key constraint violations
    console.log('Deleting related placements first...')
    const { error: placementsDeleteError } = await supabaseAdmin
      .from('placements')
      .delete()
      .in('ticket_id', ticketIds)

    if (placementsDeleteError) {
      console.error('Error deleting related placements:', placementsDeleteError)
      return { success: false, deleted: 0, errors: 1 }
    }

    console.log('Related placements deleted successfully')

    // Now delete the tickets that no longer exist in JIRA
    const { error: deleteError } = await supabaseAdmin
      .from('tickets')
      .delete()
      .in('id', ticketIds)
    
    if (deleteError) {
      console.error('Error deleting old JIRA tickets:', deleteError)
      return { success: false, deleted: 0, errors: 1 }
    }
    
    console.log(`Successfully deleted ${ticketsToDelete.length} JIRA tickets that no longer exist in JIRA`)
    
    return { success: true, deleted: ticketsToDelete.length, errors: 0 }
  } catch (error) {
    console.error('Error during JIRA ticket cleanup:', error)
    return { success: false, deleted: 0, errors: 1 }
  }
} 