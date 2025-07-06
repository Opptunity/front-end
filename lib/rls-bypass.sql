-- Temporary bypass for RLS to allow testing
-- Run this in your Supabase SQL editor if you don't have the service role key set up

-- Disable RLS for engineer trend tables temporarily
ALTER TABLE public."EngineerTrendRecommendations" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."EngineerTrendFocus" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."EngineerTrendProgress" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."EngineerLearningActivities" DISABLE ROW LEVEL SECURITY;
ALTER TABLE public."EngineerTrendGoals" DISABLE ROW LEVEL SECURITY;

-- Alternative: Create permissive policies that allow all operations
-- (Uncomment these if you prefer to keep RLS enabled but make it permissive)

/*
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow engineer trend recommendations management" ON public."EngineerTrendRecommendations";
DROP POLICY IF EXISTS "Allow engineer trend focus management" ON public."EngineerTrendFocus";
DROP POLICY IF EXISTS "Allow engineer trend progress management" ON public."EngineerTrendProgress";
DROP POLICY IF EXISTS "Allow engineer learning activities management" ON public."EngineerLearningActivities";
DROP POLICY IF EXISTS "Allow engineer trend goals management" ON public."EngineerTrendGoals";

-- Create permissive policies that allow all operations
CREATE POLICY "Allow all trend recommendations operations" 
ON public."EngineerTrendRecommendations" FOR ALL 
USING (true);

CREATE POLICY "Allow all trend focus operations" 
ON public."EngineerTrendFocus" FOR ALL 
USING (true);

CREATE POLICY "Allow all trend progress operations" 
ON public."EngineerTrendProgress" FOR ALL 
USING (true);

CREATE POLICY "Allow all learning activities operations" 
ON public."EngineerLearningActivities" FOR ALL 
USING (true);

CREATE POLICY "Allow all trend goals operations" 
ON public."EngineerTrendGoals" FOR ALL 
USING (true);
*/ 