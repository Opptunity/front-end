import { NextRequest, NextResponse } from 'next/server'
import { syncJiraTickets, syncJiraProject, cleanupDeletedJiraTickets, syncAndCleanupJiraTickets } from '@/lib/jira-sync-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action = 'sync', projectKey, maxResults = 100, cleanup = false } = body
    
    console.log('JIRA sync API called with:', { action, projectKey, maxResults, cleanup })
    
    let result
    
    switch (action) {
      case 'sync':
        if (cleanup) {
          // Use the combined sync and cleanup function
          if (projectKey) {
            // For specific projects, we need to sync then cleanup separately
            result = await syncJiraProject(projectKey, maxResults)
            const cleanupResult = await cleanupDeletedJiraTickets()
            result = { ...result, cleanup: cleanupResult }
          } else {
            result = await syncAndCleanupJiraTickets({ maxResults })
          }
        } else {
          if (projectKey) {
            // Sync specific project
            result = await syncJiraProject(projectKey, maxResults)
          } else {
            // Sync all configured projects
            result = await syncJiraTickets({ maxResults })
          }
        }
        break
        
      case 'cleanup':
        result = await cleanupDeletedJiraTickets()
        break
        
      case 'sync-and-cleanup':
        if (projectKey) {
          // For specific projects, sync then cleanup
          result = await syncJiraProject(projectKey, maxResults)
          const cleanupResult = await cleanupDeletedJiraTickets()
          result = { ...result, cleanup: cleanupResult }
        } else {
          result = await syncAndCleanupJiraTickets({ maxResults })
        }
        break
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use "sync", "cleanup", or "sync-and-cleanup"' 
        }, { status: 400 })
    }
    
    return NextResponse.json({
      success: result.success,
      message: `JIRA ${action} completed`,
      details: result
    })
    
  } catch (error) {
    console.error('Error in JIRA sync API:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'sync'
    const projectKey = searchParams.get('project')
    const maxResults = parseInt(searchParams.get('maxResults') || '50')
    const cleanup = searchParams.get('cleanup') === 'true'
    
    console.log('JIRA sync API (GET) called with:', { action, projectKey, maxResults, cleanup })
    
    let result
    
    switch (action) {
      case 'sync':
        if (cleanup) {
          // Use the combined sync and cleanup function
          if (projectKey) {
            // For specific projects, sync then cleanup
            result = await syncJiraProject(projectKey, maxResults)
            const cleanupResult = await cleanupDeletedJiraTickets()
            result = { ...result, cleanup: cleanupResult }
          } else {
            result = await syncAndCleanupJiraTickets({ maxResults })
          }
        } else {
          if (projectKey) {
            result = await syncJiraProject(projectKey, maxResults)
          } else {
            result = await syncJiraTickets({ maxResults })
          }
        }
        break
        
      case 'cleanup':
        result = await cleanupDeletedJiraTickets()
        break
        
      case 'sync-and-cleanup':
        if (projectKey) {
          // For specific projects, sync then cleanup
          result = await syncJiraProject(projectKey, maxResults)
          const cleanupResult = await cleanupDeletedJiraTickets()
          result = { ...result, cleanup: cleanupResult }
        } else {
          result = await syncAndCleanupJiraTickets({ maxResults })
        }
        break
        
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use "sync", "cleanup", or "sync-and-cleanup"' 
        }, { status: 400 })
    }
    
    return NextResponse.json({
      success: result.success,
      message: `JIRA ${action} completed`,
      details: result
    })
    
  } catch (error) {
    console.error('Error in JIRA sync API (GET):', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 })
  }
} 