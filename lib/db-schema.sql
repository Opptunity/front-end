-- This file contains the SQL schema for our users table in Supabase
-- You can run this in the Supabase SQL editor to create the table

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  role TEXT DEFAULT 'jobSeeker',
  "jobTitle" TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading any user
CREATE POLICY "Allow reading any user" 
ON public.users FOR SELECT 
USING (true);

-- Create policy to allow users to update their own record
CREATE POLICY "Allow users to update their own record" 
ON public.users FOR UPDATE 
USING (auth.email() = email);

-- Create policy to allow service role to do anything
CREATE POLICY "Allow service role full access" 
ON public.users 
USING (auth.role() = 'service_role');

-- Optional: Add some indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users (email);
CREATE INDEX IF NOT EXISTS users_role_idx ON public.users (role);

-- Create cv_data table for storing CV data and assessment results
CREATE TABLE IF NOT EXISTS public.cv_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  local_id TEXT,
  original_text TEXT,
  parsed_data JSONB,
  assessment_results JSONB,
  file_name TEXT,
  file_type TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for cv_data
ALTER TABLE public.cv_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading any cv_data
CREATE POLICY "Allow reading any cv_data" 
ON public.cv_data FOR SELECT 
USING (true);

-- Create policy to allow users to update their own cv_data
CREATE POLICY "Allow users to update their own cv_data" 
ON public.cv_data FOR UPDATE 
USING (auth.email() = email OR auth.role() = 'service_role');

-- Create policy to allow service role to do anything
CREATE POLICY "Allow service role full access to cv_data" 
ON public.cv_data
USING (auth.role() = 'service_role');

-- Create index on cv_data email and local_id
CREATE INDEX IF NOT EXISTS cv_data_email_idx ON public.cv_data (email);
CREATE INDEX IF NOT EXISTS cv_data_local_id_idx ON public.cv_data (local_id);

-- Create Assessments table for storing user assessment data
CREATE TABLE IF NOT EXISTS public."Assessments" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID REFERENCES public.users(id),
  name TEXT,
  summary TEXT,
  industry TEXT,
  score INTEGER,
  cv_text TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for Assessments
ALTER TABLE public."Assessments" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading any assessment
CREATE POLICY "Allow reading any assessment" 
ON public."Assessments" FOR SELECT 
USING (true);

-- Create policy to allow users to update their own assessments
CREATE POLICY "Allow users to update their own assessments" 
ON public."Assessments" FOR UPDATE 
USING (auth.uid() = "userId" OR auth.role() = 'service_role');

-- Create index on Assessments userId
CREATE INDEX IF NOT EXISTS assessments_user_id_idx ON public."Assessments" ("userId");

-- Create UserAssessmentDetails table for storing detailed assessment data
CREATE TABLE IF NOT EXISTS public."UserAssessmentDetails" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public."Assessments"(id),
  "userId" UUID REFERENCES public.users(id),
  technical_skills JSONB,
  soft_skills JSONB,
  strengths JSONB,
  improvement_areas JSONB,
  recommendations JSONB,
  industry_analysis JSONB,
  career_trajectory JSONB,
  skill_gap_analysis JSONB,
  cv_text TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for UserAssessmentDetails
ALTER TABLE public."UserAssessmentDetails" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading any assessment details
CREATE POLICY "Allow reading any assessment details" 
ON public."UserAssessmentDetails" FOR SELECT 
USING (true);

-- Create policy to allow users to update their own assessment details
CREATE POLICY "Allow users to update their own assessment details" 
ON public."UserAssessmentDetails" FOR UPDATE 
USING (auth.uid() = "userId" OR auth.role() = 'service_role');

-- Create index on UserAssessmentDetails assessment_id and userId
CREATE INDEX IF NOT EXISTS user_assessment_details_assessment_id_idx ON public."UserAssessmentDetails" (assessment_id);
CREATE INDEX IF NOT EXISTS user_assessment_details_user_id_idx ON public."UserAssessmentDetails" ("userId"); 