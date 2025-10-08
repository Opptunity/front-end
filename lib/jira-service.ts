// JIRA API service for fetching tickets from JIRA projects
import { generateId } from "@/lib/utils"

// Define types for JIRA API responses
export interface JiraIssue {
  id: string
  key: string
  fields: {
    summary: string
    description?: string
    status: {
      name: string
      statusCategory: {
        key: string
        name: string
      }
    }
    priority?: {
      name: string
      id: string
    }
    assignee?: {
      displayName: string
      emailAddress: string
      accountId: string
    }
    reporter?: {
      displayName: string
      emailAddress: string
      accountId: string
    }
    created: string
    updated: string
    resolutiondate?: string
    duedate?: string
    issuetype: {
      name: string
      iconUrl: string
    }
    project: {
      key: string
      name: string
    }
    labels: string[]
    components: Array<{
      name: string
      description?: string
    }>
    customfield_10000?: string // Epic Link (common custom field)
    // Add any other custom fields your JIRA instance uses
    [key: string]: any
  }
}

export interface JiraProject {
  id: string
  key: string
  name: string
  description?: string
  projectTypeKey: string
  simplified: boolean
}

// Transformed ticket type that matches our application structure
export interface JiraTicket {
  id: string
  ticket_number: string
  company_name: string
  position_title: string
  status: string
  priority: string
  required_skills: string[]
  preferred_skills: string[]
  experience_level?: string
  location?: string
  work_arrangement?: string
  contract_type?: string
  start_date?: string
  end_date?: string
  budget_min?: number
  budget_max?: number
  currency?: string
  created_at: string
  updated_at: string
  assigned_to?: string
  project_description?: string
  special_requirements?: string
  created_by_user?: {
    email: string
    username: string
  }
  source: 'jira'
  jira_key: string
  jira_project: string
}

// Cache for JIRA API responses
const jiraCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes for real-time updates

/**
 * JIRA API Configuration
 */
interface JiraConfig {
  baseUrl: string
  email: string
  apiToken: string
  projectKeys?: string[] // Optional: filter by specific projects
}

function getJiraConfig(): JiraConfig {
  const baseUrl = process.env.JIRA_BASE_URL
  const email = process.env.JIRA_EMAIL
  const apiToken = process.env.JIRA_API_TOKEN
  const projectKeys = process.env.JIRA_PROJECT_KEYS?.split(',').map(key => key.trim())

  if (!baseUrl || !email || !apiToken) {
    throw new Error('JIRA configuration is missing. Please set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN environment variables.')
  }

  return { baseUrl, email, apiToken, projectKeys }
}

/**
 * Create JIRA API headers with basic authentication
 */
function getJiraHeaders(config: JiraConfig): HeadersInit {
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')
  
  return {
    'Authorization': `Basic ${auth}`,
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json; charset=UTF-8',
    'X-ExperimentalApi': 'opt-in'
  }
}

/**
 * Fetch all projects from JIRA
 */
export async function fetchJiraProjects(): Promise<JiraProject[]> {
  const cacheKey = 'jira-projects'
  
  // Check cache first
  const cachedData = jiraCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log('Using cached JIRA projects data')
    return cachedData.data
  }

  try {
    const config = getJiraConfig()
    const headers = getJiraHeaders(config)

    console.log('Fetching JIRA projects')
    
    const response = await fetch(`${config.baseUrl}/rest/api/3/project`, {
      headers,
    })

    if (!response.ok) {
      throw new Error(`JIRA API error: ${response.status} ${response.statusText}`)
    }

    const projects: JiraProject[] = await response.json()
    
    // Filter by configured project keys if specified
    const filteredProjects = config.projectKeys 
      ? projects.filter(project => config.projectKeys!.includes(project.key))
      : projects

    // Store in cache
    jiraCache.set(cacheKey, { data: filteredProjects, timestamp: Date.now() })

    return filteredProjects
  } catch (error) {
    console.error('Error fetching JIRA projects:', error)
    throw error
  }
}

/**
 * Fetch issues from a specific JIRA project
 */
export async function fetchJiraIssues(projectKey: string, options: {
  maxResults?: number
  startAt?: number
  jql?: string
} = {}): Promise<{ issues: JiraIssue[], total: number }> {
  const { maxResults = 50, startAt = 0, jql } = options
  const cacheKey = `jira-issues-${projectKey}-${maxResults}-${startAt}-${jql || 'default'}`
  
  // Check cache first
  const cachedData = jiraCache.get(cacheKey)
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    console.log(`Using cached JIRA issues data for project ${projectKey}`)
    return cachedData.data
  }

  try {
    const config = getJiraConfig()
    const headers = getJiraHeaders(config)

    // Default JQL to fetch issues from the project, ordered by created date
    const defaultJql = `project = "${projectKey}" ORDER BY created DESC`
    const finalJql = jql || defaultJql

    console.log(`Fetching JIRA issues for project ${projectKey}`)

    // Prefer new POST /search/jql endpoint per Atlassian CHANGE-2046
    // This endpoint expects a bulk format with a queries array
    const commonFields = [
      'id',
      'key',
      'summary',
      'description',
      'status',
      'priority',
      'assignee',
      'reporter',
      'created',
      'updated',
      'resolutiondate',
      'duedate',
      'issuetype',
      'project',
      'labels',
      'components'
    ]

    const jqlBulkBody = {
      queries: [
        {
          jql: finalJql,
          startAt,
          maxResults,
          fields: commonFields
        }
      ]
    }

    // Try multiple shapes for the new /search/jql endpoint
    const jqlPayloadCandidates: any[] = [
      // Official bulk shape (most likely)
      jqlBulkBody,
      // Bulk with top-level fields include object
      { queries: [{ jql: finalJql, startAt, maxResults }], fields: { include: commonFields } },
      // Minimal bulk
      { queries: [{ jql: finalJql }] },
      // Single-query shapes that some tenants accept
      { jql: finalJql, startAt, maxResults, fields: commonFields },
      { query: finalJql, startAt, maxResults, fields: commonFields }
    ]

    let response: Response | null = null
    let lastBodyText = ''
    for (const candidate of jqlPayloadCandidates) {
      const res = await fetch(`${config.baseUrl}/rest/api/3/search/jql`, {
        method: 'POST',
        headers,
        body: JSON.stringify(candidate)
      })
      if (res.ok) {
        response = res
        break
      }
      // Stop trying alternatives if endpoint itself is missing/deprecated
      if (res.status === 404 || res.status === 410) {
        response = res
        break
      }
      lastBodyText = await res.text().catch(() => '')
      console.warn('Variant /search/jql payload failed:', { status: res.status, body: lastBodyText })
    }

    // Fall back to classic POST /search if endpoint is missing OR all variants returned 400
    if (!response || response.status === 404 || response.status === 410 || response.status === 400) {
      console.warn('Falling back to classic /rest/api/3/search...')
      const searchBody = { jql: finalJql, startAt, maxResults, fields: commonFields }
      response = await fetch(`${config.baseUrl}/rest/api/3/search`, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchBody)
      })
    }

    if (!response || !response.ok) {
      // As a final fallback, try the Agile API (boards → issues) using GET
      console.warn('Falling back to Agile API (board issues) ...')
      try {
        // 1) Find a board for this project
        const boardsRes = await fetch(`${config.baseUrl}/rest/agile/1.0/board?projectKeyOrId=${encodeURIComponent(projectKey)}`, { headers })
        if (!boardsRes.ok) {
          const body = await boardsRes.text().catch(() => '')
          throw new Error(`Agile boards fetch failed: ${boardsRes.status} ${boardsRes.statusText} :: ${body}`)
        }
        const boardsData = await boardsRes.json()
        const board = (boardsData.values || [])[0]
        if (!board) {
          throw new Error('No agile boards found for project')
        }

        // 2) Fetch issues from the board
        const params = new URLSearchParams({
          maxResults: String(maxResults),
          startAt: String(startAt)
        })
        if (finalJql) params.set('jql', finalJql)
        const issuesRes = await fetch(`${config.baseUrl}/rest/agile/1.0/board/${board.id}/issue?${params.toString()}`, { headers })
        if (!issuesRes.ok) {
          const body = await issuesRes.text().catch(() => '')
          throw new Error(`Agile board issues fetch failed: ${issuesRes.status} ${issuesRes.statusText} :: ${body}`)
        }
        const issuesData = await issuesRes.json()
        // Normalize to JiraIssue[] shape as best as possible
        const agileIssues = (issuesData.issues || []) as JiraIssue[]
        const result = { issues: agileIssues, total: typeof issuesData.total === 'number' ? issuesData.total : agileIssues.length }
        // Cache and return
        jiraCache.set(cacheKey, { data: result, timestamp: Date.now() })
        return result
      } catch (agileErr) {
        const bodyText = response ? await response.text().catch(() => lastBodyText) : lastBodyText
        const status = response ? response.status : 'no-response'
        const statusText = response ? response.statusText : 'fetch-error'
        console.error('Agile API fallback failed:', agileErr)
        throw new Error(`JIRA API error: ${status} ${statusText} :: ${bodyText}`)
      }
    }

    const data = await response.json()
    // Support both legacy and new bulk JQL shapes
    let issues: JiraIssue[] = []
    let total: number = 0
    if (Array.isArray(data.results)) {
      const first = data.results[0] || {}
      issues = (first.issues || []) as JiraIssue[]
      total = typeof first.total === 'number' ? first.total : issues.length
    } else {
      issues = (data.issues || []) as JiraIssue[]
      total = typeof data.total === 'number' ? data.total : issues.length
    }
    const result = { issues, total }

    // Store in cache
    jiraCache.set(cacheKey, { data: result, timestamp: Date.now() })

    return result
  } catch (error) {
    console.error(`Error fetching JIRA issues for project ${projectKey}:`, error)
    throw error
  }
}

/**
 * Fetch all issues from configured JIRA projects
 */
export async function fetchAllJiraIssues(options: {
  maxResults?: number
  jql?: string
} = {}): Promise<JiraIssue[]> {
  try {
    const config = getJiraConfig()
    
    // If specific project keys are configured, use them
    if (config.projectKeys && config.projectKeys.length > 0) {
      const allIssues: JiraIssue[] = []
      
      for (const projectKey of config.projectKeys) {
        const { issues } = await fetchJiraIssues(projectKey, options)
        allIssues.push(...issues)
      }
      
      // Sort by created date (newest first)
      return allIssues.sort((a, b) => 
        new Date(b.fields.created).getTime() - new Date(a.fields.created).getTime()
      )
    } else {
      // Fetch from all projects
      const projects = await fetchJiraProjects()
      const allIssues: JiraIssue[] = []
      
      for (const project of projects) {
        const { issues } = await fetchJiraIssues(project.key, options)
        allIssues.push(...issues)
      }
      
      // Sort by created date (newest first)
      return allIssues.sort((a, b) => 
        new Date(b.fields.created).getTime() - new Date(a.fields.created).getTime()
      )
    }
  } catch (error) {
    console.error('Error fetching all JIRA issues:', error)
    throw error
  }
}

/**
 * Transform JIRA issue to our application's ticket format
 */
export function transformJiraIssueToTicket(issue: JiraIssue): JiraTicket {
  // Map JIRA status to our application status
  const mapStatus = (jiraStatus: string): string => {
    const status = jiraStatus.toLowerCase()
    if (status.includes('to do') || status.includes('open') || status.includes('new')) return 'new'
    if (status.includes('in progress') || status.includes('in review')) return 'in_progress'
    if (status.includes('done') || status.includes('closed') || status.includes('resolved')) return 'completed'
    if (status.includes('blocked') || status.includes('hold')) return 'on_hold'
    if (status.includes('cancelled')) return 'cancelled'
    return 'assigned'
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

  // Extract skills from labels and components
  const extractSkills = (labels: string[], components: any[]): string[] => {
    const skills = [...labels]
    if (components) {
      skills.push(...components.map(c => c.name))
    }
    return skills.filter(skill => skill && skill.length > 0)
  }

  return {
    id: issue.id,
    ticket_number: issue.key,
    company_name: issue.fields.project.name,
    position_title: issue.fields.summary,
    status: mapStatus(issue.fields.status.name),
    priority: mapPriority(issue.fields.priority?.name),
    required_skills: extractSkills(issue.fields.labels || [], issue.fields.components || []),
    preferred_skills: [],
    created_at: issue.fields.created,
    updated_at: issue.fields.updated,
    assigned_to: issue.fields.assignee?.emailAddress,
    project_description: issue.fields.description || '',
    created_by_user: issue.fields.reporter ? {
      email: issue.fields.reporter.emailAddress,
      username: issue.fields.reporter.displayName
    } : undefined,
    source: 'jira',
    jira_key: issue.key,
    jira_project: issue.fields.project.key,
    start_date: issue.fields.duedate,
    currency: 'USD'
  }
}

/**
 * Fetch and transform JIRA tickets for the delivery manager
 */
export async function fetchJiraTickets(options: {
  search?: string
  status?: string
  priority?: string
  maxResults?: number
} = {}): Promise<JiraTicket[]> {
  try {
    const { search, status, priority, maxResults = 50 } = options
    
    // Build JQL query based on filters
    let jqlParts: string[] = []
    
    // Add project filter if configured
    const config = getJiraConfig()
    if (config.projectKeys && config.projectKeys.length > 0) {
      jqlParts.push(`project in (${config.projectKeys.map(key => `"${key}"`).join(', ')})`)
    }
    
    // Add search filter
    if (search) {
      jqlParts.push(`(summary ~ "${search}" OR description ~ "${search}")`)
    }
    
    // Add status filter
    if (status && status !== 'all') {
      const jiraStatuses = getJiraStatusesForAppStatus(status)
      if (jiraStatuses.length > 0) {
        jqlParts.push(`status in (${jiraStatuses.map(s => `"${s}"`).join(', ')})`)
      }
    }
    
    // Add priority filter
    if (priority && priority !== 'all') {
      const jiraPriorities = getJiraPrioritiesForAppPriority(priority)
      if (jiraPriorities.length > 0) {
        jqlParts.push(`priority in (${jiraPriorities.map(p => `"${p}"`).join(', ')})`)
      }
    }
    
    const jql = jqlParts.join(' AND ') + ' ORDER BY created DESC'
    
    console.log('Fetching JIRA tickets with JQL:', jql)
    
    const issues = await fetchAllJiraIssues({ maxResults, jql })
    return issues.map(transformJiraIssueToTicket)
  } catch (error) {
    console.error('Error fetching JIRA tickets:', error)
    return []
  }
}

/**
 * Helper function to map application status to JIRA statuses
 */
function getJiraStatusesForAppStatus(appStatus: string): string[] {
  switch (appStatus) {
    case 'new':
      return ['To Do', 'Open', 'New', 'Backlog']
    case 'assigned':
      return ['Assigned', 'Selected for Development']
    case 'in_progress':
      return ['In Progress', 'In Development', 'In Review']
    case 'on_hold':
      return ['Blocked', 'On Hold', 'Waiting']
    case 'completed':
      return ['Done', 'Closed', 'Resolved', 'Complete']
    case 'cancelled':
      return ['Cancelled', 'Rejected']
    default:
      return []
  }
}

/**
 * Helper function to map application priority to JIRA priorities
 */
function getJiraPrioritiesForAppPriority(appPriority: string): string[] {
  switch (appPriority) {
    case 'urgent':
      return ['Highest', 'Critical']
    case 'high':
      return ['High']
    case 'medium':
      return ['Medium']
    case 'low':
      return ['Low', 'Lowest']
    default:
      return []
  }
}

/**
 * Clear JIRA cache (useful for testing or manual refresh)
 */
export function clearJiraCache(): void {
  jiraCache.clear()
  console.log('JIRA cache cleared')
} 