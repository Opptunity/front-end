# JIRA Database Integration

This document explains how JIRA tickets are synchronized and stored in your local database for seamless integration with your delivery manager system.

## Overview

The JIRA Database Integration stores JIRA tickets in your local PostgreSQL/Supabase database, allowing you to:

- View JIRA tickets alongside local tickets in the delivery manager interface
- Access JIRA ticket details even when JIRA is temporarily unavailable
- Perform local operations like searching and filtering on JIRA tickets
- Maintain a consistent data structure between local and JIRA tickets
- Track synchronization status and changes

## Database Schema Updates

### New Fields Added to `tickets` Table

The following fields have been added to support JIRA integration:

```sql
-- Source tracking
source TEXT DEFAULT 'local' CHECK (source IN ('local', 'jira')),

-- JIRA-specific fields
jira_key TEXT,              -- JIRA issue key (e.g., 'PROJ-123')
jira_project TEXT,          -- JIRA project key (e.g., 'PROJ')
jira_issue_id TEXT,         -- JIRA internal issue ID
jira_url TEXT,              -- Direct link to JIRA issue
jira_last_sync TIMESTAMP,   -- When this ticket was last synced from JIRA

-- Extended status mapping
jira_status TEXT,           -- Original JIRA status name
jira_priority TEXT,         -- Original JIRA priority name

-- Additional metadata for compatibility
contact_name TEXT,          -- Alternative to client_name
contact_email TEXT,         -- Alternative to client_email
contact_phone TEXT,         -- Alternative to client_phone
company_name TEXT,          -- Alternative to client_company
location TEXT,              -- Alternative to work_location
end_date DATE               -- Contract end date
```

### Indexes and Constraints

```sql
-- Performance indexes
CREATE UNIQUE INDEX tickets_jira_key_idx ON tickets (jira_key) WHERE jira_key IS NOT NULL;
CREATE INDEX tickets_source_idx ON tickets (source);
CREATE INDEX tickets_jira_project_idx ON tickets (jira_project) WHERE jira_project IS NOT NULL;

-- Data integrity constraints
ALTER TABLE tickets ADD CONSTRAINT check_jira_fields 
CHECK (
  (source = 'local') OR 
  (source = 'jira' AND jira_key IS NOT NULL AND jira_project IS NOT NULL)
);
```

## Migration Process

### 1. Database Migration

Run the migration script to add JIRA support to your existing database:

```sql
-- Run this in your Supabase SQL editor
\i lib/migrations/add-jira-support.sql
```

This will:
- Add all new JIRA-related columns
- Set existing tickets to `source = 'local'`
- Create necessary indexes and constraints
- Update RLS policies for JIRA ticket access

### 2. Environment Configuration

Configure your JIRA connection in `.env.local`:

```bash
# JIRA Configuration
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=your-jira-email@company.com
JIRA_API_TOKEN=your_jira_api_token_here
JIRA_PROJECT_KEYS=PROJ1,PROJ2,PROJ3  # Optional
```

## Synchronization Process

### How It Works

1. **Automatic Sync**: When delivery managers access the tickets page, a quick JIRA sync is triggered
2. **Manual Sync**: Delivery managers can click the "Sync JIRA" button for immediate synchronization
3. **Incremental Updates**: Only changed JIRA tickets are updated in the database
4. **Intelligent Caching**: Reduces API calls to JIRA while keeping data fresh

### Synchronization Logic

```typescript
// Sync process for each JIRA issue
1. Check if JIRA ticket exists in database (by jira_key)
2. If exists:
   - Compare JIRA updated timestamp with last_sync timestamp
   - Update only if JIRA issue is newer
3. If not exists:
   - Transform JIRA issue to database format
   - Insert new ticket record
4. Update jira_last_sync timestamp
```

### Field Mapping

| JIRA Field | Database Field | Notes |
|------------|----------------|-------|
| issue.key | ticket_number, jira_key | Used as ticket number |
| issue.fields.summary | position_title | JIRA summary becomes position title |
| issue.fields.project.name | company_name, client_company | Project name used as company |
| issue.fields.description | project_description | Full description stored |
| issue.fields.status.name | status, jira_status | Mapped to app status + original stored |
| issue.fields.priority.name | priority, jira_priority | Mapped to app priority + original stored |
| issue.fields.labels | required_skills | Labels become required skills |
| issue.fields.components | required_skills | Components added to skills |
| issue.fields.assignee | assigned_to | Assignee email address |
| issue.fields.reporter | created_by, contact_name | Reporter becomes contact |
| issue.fields.created | created_at | Original creation date preserved |
| issue.fields.updated | updated_at | Last update time |
| issue.fields.duedate | start_date | Due date becomes start date |

### Status Mapping

JIRA statuses are automatically mapped to your application's status values:

| JIRA Status | App Status | Description |
|-------------|------------|-------------|
| To Do, Open, New, Backlog | pending | Initial state |
| Assigned, Selected for Development | in-review | Under review |
| In Progress, In Development, In Review | in-review | Being worked on |
| Blocked, On Hold, Waiting | pending | Temporarily stopped |
| Done, Closed, Resolved, Complete | completed | Finished |
| Cancelled, Rejected | cancelled | Not proceeding |

### Priority Mapping

| JIRA Priority | App Priority |
|---------------|--------------|
| Highest, Critical | urgent |
| High | high |
| Medium | medium |
| Low, Lowest | low |

## API Endpoints

### Automatic Sync in Tickets API

The main tickets API (`/api/tickets`) automatically triggers JIRA sync for delivery managers:

```typescript
GET /api/tickets
// Automatically syncs JIRA tickets if:
// - include_jira != 'false'
// - No created_by filter (indicates delivery manager access)
```

### Manual Sync API

Dedicated endpoint for manual synchronization:

```typescript
// Sync all configured projects
GET /api/jira-sync?action=sync&maxResults=100

// Sync specific project
GET /api/jira-sync?action=sync&project=PROJ1&maxResults=50

// Cleanup old tickets
GET /api/jira-sync?action=cleanup

// Sync with cleanup
GET /api/jira-sync?action=sync&cleanup=true

// POST version with JSON body
POST /api/jira-sync
{
  "action": "sync",
  "projectKey": "PROJ1",
  "maxResults": 100,
  "cleanup": false
}
```

### Response Format

```json
{
  "success": true,
  "message": "JIRA sync completed",
  "details": {
    "success": true,
    "synced": 25,
    "errors": 0,
    "cleanup": {
      "success": true,
      "deleted": 0
    }
  }
}
```

## User Interface Integration

### Delivery Manager Tickets Page

- **JIRA Badge**: Blue "JIRA" badge identifies JIRA tickets
- **JIRA Key**: Issue keys (e.g., "PROJ-123") displayed with tickets
- **Source Statistics**: Header shows Local vs JIRA ticket counts
- **Sync Button**: Manual "Sync JIRA" button with loading animation
- **Toggle Control**: Switch to include/exclude JIRA tickets

### Ticket Detail Page

- **JIRA Indicator**: Blue badge and external link icon for JIRA tickets
- **Direct Link**: Clickable external link to view ticket in JIRA
- **Field Compatibility**: Handles both local and JIRA field names
- **Action Restrictions**: "Find Candidates" disabled for JIRA tickets

## Performance Optimizations

### Caching Strategy

- **5-minute cache** for JIRA API responses
- **Incremental sync** based on update timestamps
- **Conditional updates** only when JIRA data is newer
- **Batched operations** for multiple ticket updates

### Database Optimizations

- **Unique index** on `jira_key` for fast lookups
- **Partial indexes** on JIRA-specific fields
- **Compound indexes** for common query patterns
- **RLS policies** optimized for source-based access

### API Rate Limiting

- **Respects JIRA rate limits** with appropriate delays
- **Configurable max results** to control API usage
- **Graceful degradation** when JIRA is unavailable
- **Background sync** option for large datasets

## Monitoring and Troubleshooting

### Sync Status Monitoring

Check synchronization status through the UI:
- Header statistics show sync results
- Console logs provide detailed sync information
- Error messages displayed for failed syncs

### Common Issues and Solutions

1. **"JIRA configuration is missing"**
   ```bash
   # Ensure environment variables are set
   echo $JIRA_BASE_URL
   echo $JIRA_EMAIL
   echo $JIRA_API_TOKEN
   ```

2. **"Failed to sync JIRA tickets"**
   - Check JIRA authentication credentials
   - Verify project access permissions
   - Check network connectivity to JIRA instance

3. **"Duplicate JIRA key error"**
   - Indicates data integrity issue
   - Check for manual data modifications
   - Run cleanup and re-sync

4. **Slow sync performance**
   - Reduce `maxResults` parameter
   - Limit `JIRA_PROJECT_KEYS` to essential projects
   - Consider off-peak sync scheduling

### Debugging SQL Queries

```sql
-- Check JIRA ticket sync status
SELECT 
  source,
  COUNT(*) as count,
  MAX(jira_last_sync) as last_sync,
  MAX(updated_at) as last_update
FROM tickets 
GROUP BY source;

-- Find tickets needing sync
SELECT jira_key, jira_last_sync, updated_at
FROM tickets 
WHERE source = 'jira' 
  AND (jira_last_sync IS NULL OR jira_last_sync < updated_at);

-- Check for sync errors
SELECT jira_key, jira_project, created_at, jira_last_sync
FROM tickets 
WHERE source = 'jira' 
  AND jira_last_sync IS NULL;
```

## Maintenance and Best Practices

### Regular Maintenance

1. **Monitor sync frequency** to avoid API rate limits
2. **Clean up stale tickets** periodically
3. **Review field mappings** when JIRA workflow changes
4. **Update indexes** if query patterns change

### Best Practices

1. **Environment-specific configuration** for different JIRA instances
2. **Regular backups** before major sync operations
3. **Test sync process** in development before production
4. **Monitor JIRA API quotas** and usage patterns

### Scaling Considerations

For large JIRA instances:
- Implement **pagination** for sync operations
- Use **background job processing** for sync operations
- Consider **incremental sync schedules** (every 15-30 minutes)
- Implement **webhook integration** for real-time updates

## Security Considerations

### Data Access Control

- **RLS policies** restrict JIRA ticket access to authenticated users
- **Service role permissions** for sync operations
- **Field-level security** for sensitive JIRA data

### API Security

- **Secure storage** of JIRA API tokens
- **Token rotation** policies and procedures
- **Network security** for JIRA API communication
- **Audit logging** for sync operations

### Data Privacy

- **Minimal data sync** - only necessary fields
- **Data retention** policies for synced tickets
- **Compliance** with organizational data policies 

## Automatic Cleanup of Deleted Tickets

### How It Works

The system now automatically detects and removes JIRA tickets that have been deleted from JIRA but still exist in your local database. This ensures that your delivery manager interface stays in sync with JIRA.

### Cleanup Process

1. **Automatic Cleanup**: When delivery managers access the tickets page, the system automatically:
   - Syncs the latest JIRA tickets
   - Compares the current JIRA issues with the database
   - Removes any tickets that no longer exist in JIRA

2. **Manual Cleanup**: You can also trigger cleanup manually using the API:
   ```bash
   # Clean up deleted tickets only
   GET /api/jira-sync?action=cleanup
   
   # Sync and cleanup in one operation
   GET /api/jira-sync?action=sync-and-cleanup
   
   # Sync with cleanup option
   GET /api/jira-sync?action=sync&cleanup=true
   ```

### Cleanup Logic

The cleanup function works by:
1. Fetching all JIRA tickets from your database
2. Fetching all current issues from JIRA
3. Comparing the two lists
4. Deleting any database tickets whose JIRA keys no longer exist in JIRA

This ensures that:
- Tickets deleted in JIRA are automatically removed from your database
- The delivery manager interface always shows current data
- No orphaned tickets remain in the system

### Performance Considerations

- Cleanup is limited to 1000 JIRA issues per run to avoid API rate limits
- Cleanup runs automatically when delivery managers access the tickets page
- Manual cleanup can be triggered for larger datasets
- The process is designed to be safe and won't delete tickets that still exist in JIRA

### Monitoring Cleanup

You can monitor cleanup operations through:
- Console logs showing cleanup results
- API response details including deleted count
- Database queries to verify ticket removal

```sql
-- Check for any remaining JIRA tickets that might be stale
SELECT jira_key, jira_last_sync, updated_at
FROM tickets 
WHERE source = 'jira' 
  AND jira_last_sync < NOW() - INTERVAL '1 hour';
```

## Troubleshooting

### Foreign Key Constraint Violations

**Issue**: When deleting JIRA tickets, you might encounter this error:
```
update or delete on table "tickets" violates foreign key constraint "placements_ticket_id_fkey" on table "placements"
```

**Cause**: This happens when trying to delete tickets that have related placements, but the foreign key constraint doesn't have CASCADE delete behavior.

**Solution**: 

1. **Immediate Fix**: The JIRA sync service now automatically deletes related placements before deleting tickets.

2. **Permanent Fix**: Run the database migration to fix the foreign key constraints:
   ```sql
   -- Run the migration file: lib/migrations/fix-placements-foreign-key.sql
   -- This will recreate the foreign key constraints with CASCADE delete
   ```

3. **Manual Fix**: If you need to fix this manually:
   ```sql
   -- Delete related placements first
   DELETE FROM placements WHERE ticket_id IN (
     SELECT id FROM tickets WHERE jira_key = 'SPECIFIC-JIRA-KEY'
   );
   
   -- Then delete the ticket
   DELETE FROM tickets WHERE jira_key = 'SPECIFIC-JIRA-KEY';
   ```

**Prevention**: The foreign key constraints now include `ON DELETE CASCADE`, which automatically handles related record deletion:
```sql
ALTER TABLE public.placements 
ADD CONSTRAINT placements_ticket_id_fkey 
FOREIGN KEY (ticket_id) 
REFERENCES public.tickets(id) 
ON DELETE CASCADE;
```

### JIRA API Rate Limits

If you encounter rate limit errors:
- Reduce `maxResults` parameter in sync calls
- Increase delay between API calls
- Use incremental sync instead of full sync
- Monitor JIRA API usage quotas

### Data Inconsistencies

If you notice data inconsistencies between JIRA and your database:
1. Check the AI extraction logs for any errors
2. Verify JIRA field mappings in the transformation logic
3. Run a manual sync with logging enabled
4. Compare specific tickets between JIRA and database

## Database Maintenance

### Regular Maintenance Tasks

1. **Cleanup old tickets**: Run cleanup weekly or daily
2. **Monitor sync performance**: Check sync duration and success rates
3. **Verify foreign key constraints**: Ensure CASCADE deletes work properly
4. **Update field mappings**: Review when JIRA workflow changes

### Database Schema Updates

When updating the database schema for JIRA integration:

1. **Backup your data** before making changes
2. **Test in development** first
3. **Run migrations during low-traffic periods**
4. **Verify constraints** after schema changes:
   ```sql
   -- Check foreign key constraints have CASCADE delete
   SELECT 
       tc.constraint_name,
       tc.table_name,
       rc.delete_rule
   FROM information_schema.table_constraints AS tc 
       JOIN information_schema.referential_constraints AS rc
           ON tc.constraint_name = rc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY' 
       AND tc.table_name = 'placements';
   ``` 