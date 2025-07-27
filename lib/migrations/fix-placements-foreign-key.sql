-- Fix foreign key constraint for placements table to include CASCADE delete
-- This ensures that when a ticket is deleted, related placements are automatically deleted

-- First, check if the constraint exists and drop it if it doesn't have CASCADE
DO $$
BEGIN
    -- Drop the existing foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'placements_ticket_id_fkey' 
        AND table_name = 'placements'
    ) THEN
        ALTER TABLE public.placements 
        DROP CONSTRAINT placements_ticket_id_fkey;
        RAISE NOTICE 'Dropped existing placements_ticket_id_fkey constraint';
    END IF;
END $$;

-- Recreate the foreign key constraint with CASCADE delete
ALTER TABLE public.placements 
ADD CONSTRAINT placements_ticket_id_fkey 
FOREIGN KEY (ticket_id) 
REFERENCES public.tickets(id) 
ON DELETE CASCADE;

-- Also ensure the profiler foreign key has CASCADE delete
DO $$
BEGIN
    -- Drop the existing profiler foreign key constraint if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'placements_profiler_id_fkey' 
        AND table_name = 'placements'
    ) THEN
        ALTER TABLE public.placements 
        DROP CONSTRAINT placements_profiler_id_fkey;
        RAISE NOTICE 'Dropped existing placements_profiler_id_fkey constraint';
    END IF;
END $$;

-- Recreate the profiler foreign key constraint with CASCADE delete
ALTER TABLE public.placements 
ADD CONSTRAINT placements_profiler_id_fkey 
FOREIGN KEY (profiler_id) 
REFERENCES public.profilers(id) 
ON DELETE CASCADE;

-- Verify the constraints were created correctly
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
    JOIN information_schema.referential_constraints AS rc
        ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'placements'
    AND tc.constraint_name IN ('placements_ticket_id_fkey', 'placements_profiler_id_fkey'); 