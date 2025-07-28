-- Migration script to add JIRA support to existing tickets table
-- Run this in your Supabase SQL editor if you already have a tickets table

-- Add source tracking fields
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'local',
ADD COLUMN IF NOT EXISTS jira_key TEXT,
ADD COLUMN IF NOT EXISTS jira_project TEXT,
ADD COLUMN IF NOT EXISTS jira_issue_id TEXT,
ADD COLUMN IF NOT EXISTS jira_url TEXT,
ADD COLUMN IF NOT EXISTS jira_last_sync TIMESTAMP WITH TIME ZONE;

-- Add extended status mapping
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS jira_status TEXT,
ADD COLUMN IF NOT EXISTS jira_priority TEXT;

-- Add end date for contract tracking
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add alternative field names for backward compatibility
ALTER TABLE public.tickets 
ADD COLUMN IF NOT EXISTS contact_name TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update existing tickets to have 'local' source
UPDATE public.tickets SET source = 'local' WHERE source IS NULL;

-- Add check constraint for source field
ALTER TABLE public.tickets 
ADD CONSTRAINT check_source_valid 
CHECK (source IN ('local', 'jira'));

-- Add constraint to ensure JIRA tickets have required JIRA fields
ALTER TABLE public.tickets 
ADD CONSTRAINT check_jira_fields 
CHECK (
  (source = 'local') OR 
  (source = 'jira' AND jira_key IS NOT NULL AND jira_project IS NOT NULL)
);

-- Add indexes for better performance
CREATE UNIQUE INDEX IF NOT EXISTS tickets_jira_key_idx ON public.tickets (jira_key) WHERE jira_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS tickets_source_idx ON public.tickets (source);
CREATE INDEX IF NOT EXISTS tickets_jira_project_idx ON public.tickets (jira_project) WHERE jira_project IS NOT NULL;
CREATE INDEX IF NOT EXISTS tickets_status_idx ON public.tickets (status);
CREATE INDEX IF NOT EXISTS tickets_priority_idx ON public.tickets (priority);
CREATE INDEX IF NOT EXISTS tickets_created_by_idx ON public.tickets (created_by);

-- Update RLS policies to handle JIRA tickets
-- (These may already exist, so we use CREATE OR REPLACE where possible)

-- Create function to check if user can access JIRA tickets
CREATE OR REPLACE FUNCTION can_access_jira_tickets()
RETURNS BOOLEAN AS $$
BEGIN
  -- Allow service role and authenticated users to access JIRA tickets
  RETURN (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);
END;
$$ LANGUAGE plpgsql;

-- Update policy for reading tickets to include JIRA tickets
DROP POLICY IF EXISTS "Allow reading any ticket" ON public.tickets;
CREATE POLICY "Allow reading any ticket" 
ON public.tickets FOR SELECT 
USING (
  source = 'local' OR 
  (source = 'jira' AND can_access_jira_tickets())
);

-- Allow service role to insert JIRA tickets
DROP POLICY IF EXISTS "Allow service role to manage tickets" ON public.tickets;
CREATE POLICY "Allow service role to manage tickets" 
ON public.tickets 
USING (auth.role() = 'service_role'); 