import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cleanupDeletedJiraTickets } from '@/lib/jira-sync-service'

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') || 'status'
    
    console.log('JIRA cleanup test API called with action:', action)
    
    switch (action) {
      case 'status':
        // Check current status of tickets and placements
        const { data: tickets, error: ticketsError } = await supabaseAdmin
          .from('tickets')
          .select('id, jira_key, ticket_number, source')
          .eq('source', 'jira')
          .limit(10)
        
        if (ticketsError) {
          throw new Error(`Error fetching tickets: ${ticketsError.message}`)
        }
        
        const { data: placements, error: placementsError } = await supabaseAdmin
          .from('placements')
          .select('id, ticket_id')
          .limit(10)
        
        if (placementsError) {
          throw new Error(`Error fetching placements: ${placementsError.message}`)
        }
        
        // Check foreign key constraints
        const { data: constraints, error: constraintsError } = await supabaseAdmin
          .rpc('check_foreign_key_constraints')
          .then(result => ({ data: null, error: null })) // RPC might not exist, that's okay
          .catch(() => ({ data: null, error: null }))
        
        return NextResponse.json({
          success: true,
          status: {
            jira_tickets_count: tickets?.length || 0,
            jira_tickets: tickets?.map(t => ({
              id: t.id,
              jira_key: t.jira_key,
              ticket_number: t.ticket_number
            })) || [],
            placements_count: placements?.length || 0,
            placements: placements?.map(p => ({
              id: p.id,
              ticket_id: p.ticket_id
            })) || []
          }
        })
        
      case 'test-cleanup':
        // Run the cleanup function and return detailed results
        console.log('Running JIRA cleanup test...')
        const result = await cleanupDeletedJiraTickets()
        
        return NextResponse.json({
          success: true,
          cleanup_result: result,
          message: `Cleanup completed: ${result.deleted} tickets deleted, ${result.errors} errors`
        })
        
      case 'check-constraints':
        // Check if foreign key constraints are properly configured
        const { data: constraintInfo, error: constraintError } = await supabaseAdmin
          .from('information_schema.table_constraints')
          .select('constraint_name, table_name')
          .eq('table_name', 'placements')
          .eq('constraint_type', 'FOREIGN KEY')
        
        if (constraintError) {
          console.error('Error checking constraints:', constraintError)
        }
        
        return NextResponse.json({
          success: true,
          constraints: constraintInfo || [],
          note: "Use SQL query to check constraint details: SELECT tc.constraint_name, rc.delete_rule FROM information_schema.referential_constraints rc JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name WHERE tc.table_name = 'placements'"
        })
        
      default:
        return NextResponse.json({
          error: 'Invalid action. Use: status, test-cleanup, or check-constraints'
        }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Error in JIRA cleanup test:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Check server logs for more information'
    }, { status: 500 })
  }
} 