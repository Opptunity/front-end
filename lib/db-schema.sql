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

-- ================================
-- TICKETS TABLE FOR SINGLE STAFFING
-- ================================

-- Create tickets table for the single staffing workflow
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-review', 'matched', 'placed', 'completed', 'cancelled')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Client Information
  client_name TEXT NOT NULL,
  client_company TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  
  -- Position Details
  position_title TEXT NOT NULL,
  department TEXT,
  seniority TEXT,
  contract_type TEXT,
  duration TEXT,
  start_date DATE,
  work_location TEXT,
  work_arrangement TEXT,
  
  -- Requirements (JSON fields for arrays and complex data)
  required_skills JSONB,
  preferred_skills JSONB,
  experience TEXT,
  education TEXT,
  certifications TEXT,
  
  -- Project Details
  project_description TEXT,
  responsibilities TEXT,
  
  -- Budget & Terms
  budget_min DECIMAL,
  budget_max DECIMAL,
  currency TEXT DEFAULT 'USD',
  rate_type TEXT,
  
  -- Additional Information
  urgency TEXT,
  special_requirements TEXT,
  notes TEXT,
  
  -- Assignment tracking
  assigned_to TEXT, -- Delivery Manager assigned to this ticket
  
  -- Source tracking (for JIRA integration)
  source TEXT DEFAULT 'local' CHECK (source IN ('local', 'jira')),
  jira_key TEXT, -- JIRA issue key (e.g., 'PROJ-123')
  jira_project TEXT, -- JIRA project key (e.g., 'PROJ')
  jira_issue_id TEXT, -- JIRA internal issue ID
  jira_url TEXT, -- Direct link to JIRA issue
  jira_last_sync TIMESTAMP WITH TIME ZONE, -- When this ticket was last synced from JIRA
  
  -- Extended status mapping for better JIRA compatibility
  jira_status TEXT, -- Original JIRA status name
  jira_priority TEXT, -- Original JIRA priority name
  
  -- End date for contract tracking
  end_date DATE,
  
  -- Additional metadata
  contact_name TEXT, -- Alternative to client_name for backward compatibility
  contact_email TEXT, -- Alternative to client_email for backward compatibility
  contact_phone TEXT, -- Alternative to client_phone for backward compatibility
  company_name TEXT, -- Alternative to client_company for backward compatibility
  location TEXT, -- Alternative to work_location for backward compatibility
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for JIRA integration
CREATE UNIQUE INDEX IF NOT EXISTS tickets_jira_key_idx ON public.tickets (jira_key) WHERE jira_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS tickets_source_idx ON public.tickets (source);
CREATE INDEX IF NOT EXISTS tickets_jira_project_idx ON public.tickets (jira_project) WHERE jira_project IS NOT NULL;
CREATE INDEX IF NOT EXISTS tickets_status_idx ON public.tickets (status);
CREATE INDEX IF NOT EXISTS tickets_priority_idx ON public.tickets (priority);
CREATE INDEX IF NOT EXISTS tickets_created_by_idx ON public.tickets (created_by);

-- Add constraint to ensure JIRA tickets have required JIRA fields
ALTER TABLE public.tickets ADD CONSTRAINT check_jira_fields 
  CHECK (
    (source = 'local') OR 
    (source = 'jira' AND jira_key IS NOT NULL AND jira_project IS NOT NULL)
);

-- Enable Row Level Security for tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading any ticket
CREATE POLICY "Allow reading any ticket" 
ON public.tickets FOR SELECT 
USING (true);

-- Create policy to allow users to create their own tickets
CREATE POLICY "Allow users to create tickets" 
ON public.tickets FOR INSERT 
WITH CHECK (created_by = auth.email() OR auth.role() = 'service_role');

-- Create policy to allow users to update their own tickets
CREATE POLICY "Allow users to update their own tickets" 
ON public.tickets FOR UPDATE 
USING (created_by = auth.email() OR auth.role() = 'service_role');

-- Create policy to allow service role full access
CREATE POLICY "Allow service role full access to tickets" 
ON public.tickets
USING (auth.role() = 'service_role');

-- Create indexes for tickets table
CREATE INDEX IF NOT EXISTS tickets_created_by_idx ON public.tickets (created_by);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON public.tickets (status);
CREATE INDEX IF NOT EXISTS tickets_priority_idx ON public.tickets (priority);
CREATE INDEX IF NOT EXISTS tickets_ticket_number_idx ON public.tickets (ticket_number);
CREATE INDEX IF NOT EXISTS tickets_assigned_to_idx ON public.tickets (assigned_to);
CREATE INDEX IF NOT EXISTS tickets_created_at_idx ON public.tickets (created_at);

-- ================================
-- ENGINEER-TREND INTEGRATION TABLES
-- ================================

-- Table to store engineer's focused trends (their learning goals)
CREATE TABLE IF NOT EXISTS public."EngineerTrendFocus" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id INTEGER, -- Reference to ingenieurs.ingenieur_id
  trend_id TEXT NOT NULL, -- Reference to trend ID from IT trends
  trend_name TEXT NOT NULL,
  focus_reason TEXT,
  priority_level TEXT CHECK (priority_level IN ('high', 'medium', 'low')) DEFAULT 'medium',
  target_completion_date DATE,
  current_progress INTEGER DEFAULT 0 CHECK (current_progress >= 0 AND current_progress <= 100),
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'dropped')) DEFAULT 'active',
  notes TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track engineer's learning progress for specific trend skills
CREATE TABLE IF NOT EXISTS public."EngineerTrendProgress" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_trend_focus_id UUID REFERENCES public."EngineerTrendFocus"(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT,
  current_level INTEGER CHECK (current_level >= 1 AND current_level <= 5) DEFAULT 1,
  target_level INTEGER CHECK (target_level >= 1 AND target_level <= 5) DEFAULT 3,
  learning_resources_completed JSONB DEFAULT '[]'::jsonb,
  time_invested_hours INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMP WITH TIME ZONE,
  proficiency_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store personalized trend recommendations for engineers
CREATE TABLE IF NOT EXISTS public."EngineerTrendRecommendations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id INTEGER, -- Reference to ingenieurs.ingenieur_id
  trend_id TEXT NOT NULL,
  trend_name TEXT NOT NULL,
  relevance_score INTEGER CHECK (relevance_score >= 0 AND relevance_score <= 100),
  recommendation_reason TEXT,
  market_alignment_score INTEGER CHECK (market_alignment_score >= 0 AND market_alignment_score <= 100),
  skill_gap_analysis JSONB,
  estimated_learning_time TEXT,
  career_impact_score INTEGER CHECK (career_impact_score >= 0 AND career_impact_score <= 100),
  is_dismissed BOOLEAN DEFAULT FALSE,
  recommended_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track engineer's learning activities and achievements
CREATE TABLE IF NOT EXISTS public."EngineerLearningActivities" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id INTEGER, -- Reference to ingenieurs.ingenieur_id
  trend_id TEXT,
  activity_type TEXT CHECK (activity_type IN ('course_completed', 'certification_earned', 'project_built', 'resource_read', 'skill_practiced', 'goal_achieved')),
  activity_title TEXT NOT NULL,
  activity_description TEXT,
  activity_url TEXT,
  provider TEXT,
  completion_percentage INTEGER DEFAULT 100 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  time_spent_hours DECIMAL(5,2),
  skills_gained JSONB DEFAULT '[]'::jsonb,
  achievement_proof_url TEXT,
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store engineer's trend-based learning goals (extends existing learning_goals)
CREATE TABLE IF NOT EXISTS public."EngineerTrendGoals" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id INTEGER, -- Reference to ingenieurs.ingenieur_id
  trend_id TEXT NOT NULL,
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  goal_type TEXT CHECK (goal_type IN ('skill_acquisition', 'certification', 'project_completion', 'career_transition', 'knowledge_update')),
  target_skills JSONB DEFAULT '[]'::jsonb,
  success_criteria TEXT,
  target_date DATE,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  status TEXT CHECK (status IN ('active', 'in_progress', 'completed', 'deferred', 'cancelled')) DEFAULT 'active',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  milestones JSONB DEFAULT '[]'::jsonb,
  resources_needed JSONB DEFAULT '[]'::jsonb,
  mentor_assigned TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for all new tables
ALTER TABLE public."EngineerTrendFocus" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EngineerTrendProgress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EngineerTrendRecommendations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EngineerLearningActivities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."EngineerTrendGoals" ENABLE ROW LEVEL SECURITY;

-- Create policies for EngineerTrendFocus
CREATE POLICY "Allow reading trend focus" 
ON public."EngineerTrendFocus" FOR SELECT 
USING (true);

CREATE POLICY "Allow engineer trend focus management" 
ON public."EngineerTrendFocus" FOR ALL
USING (auth.role() = 'service_role');

-- Create policies for EngineerTrendProgress
CREATE POLICY "Allow reading trend progress" 
ON public."EngineerTrendProgress" FOR SELECT 
USING (true);

CREATE POLICY "Allow engineer trend progress management" 
ON public."EngineerTrendProgress" FOR ALL
USING (auth.role() = 'service_role');

-- Create policies for EngineerTrendRecommendations
CREATE POLICY "Allow reading trend recommendations" 
ON public."EngineerTrendRecommendations" FOR SELECT 
USING (true);

CREATE POLICY "Allow engineer trend recommendations management" 
ON public."EngineerTrendRecommendations" FOR ALL
USING (auth.role() = 'service_role');

-- Create policies for EngineerLearningActivities
CREATE POLICY "Allow reading learning activities" 
ON public."EngineerLearningActivities" FOR SELECT 
USING (true);

CREATE POLICY "Allow engineer learning activities management" 
ON public."EngineerLearningActivities" FOR ALL
USING (auth.role() = 'service_role');

-- Create policies for EngineerTrendGoals
CREATE POLICY "Allow reading trend goals" 
ON public."EngineerTrendGoals" FOR SELECT 
USING (true);

CREATE POLICY "Allow engineer trend goals management" 
ON public."EngineerTrendGoals" FOR ALL
USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS engineer_trend_focus_engineer_id_idx ON public."EngineerTrendFocus" (engineer_id);
CREATE INDEX IF NOT EXISTS engineer_trend_focus_trend_id_idx ON public."EngineerTrendFocus" (trend_id);
CREATE INDEX IF NOT EXISTS engineer_trend_focus_status_idx ON public."EngineerTrendFocus" (status);

CREATE INDEX IF NOT EXISTS engineer_trend_progress_focus_id_idx ON public."EngineerTrendProgress" (engineer_trend_focus_id);
CREATE INDEX IF NOT EXISTS engineer_trend_progress_skill_idx ON public."EngineerTrendProgress" (skill_name);

CREATE INDEX IF NOT EXISTS engineer_trend_recommendations_engineer_id_idx ON public."EngineerTrendRecommendations" (engineer_id);
CREATE INDEX IF NOT EXISTS engineer_trend_recommendations_trend_id_idx ON public."EngineerTrendRecommendations" (trend_id);
CREATE INDEX IF NOT EXISTS engineer_trend_recommendations_score_idx ON public."EngineerTrendRecommendations" (relevance_score);

CREATE INDEX IF NOT EXISTS engineer_learning_activities_engineer_id_idx ON public."EngineerLearningActivities" (engineer_id);
CREATE INDEX IF NOT EXISTS engineer_learning_activities_trend_id_idx ON public."EngineerLearningActivities" (trend_id);
CREATE INDEX IF NOT EXISTS engineer_learning_activities_type_idx ON public."EngineerLearningActivities" (activity_type);

CREATE INDEX IF NOT EXISTS engineer_trend_goals_engineer_id_idx ON public."EngineerTrendGoals" (engineer_id);
CREATE INDEX IF NOT EXISTS engineer_trend_goals_trend_id_idx ON public."EngineerTrendGoals" (trend_id);
CREATE INDEX IF NOT EXISTS engineer_trend_goals_status_idx ON public."EngineerTrendGoals" (status);

-- ================================
-- ENHANCED MARKET INTELLIGENCE TABLES
-- ================================

-- Table to store real-time job market data
CREATE TABLE IF NOT EXISTS public."MarketJobData" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  location TEXT NOT NULL, -- City, State/Country
  job_count INTEGER DEFAULT 0,
  avg_salary_min INTEGER,
  avg_salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')),
  remote_percentage INTEGER CHECK (remote_percentage >= 0 AND remote_percentage <= 100),
  top_companies JSONB DEFAULT '[]'::jsonb,
  trending_keywords JSONB DEFAULT '[]'::jsonb,
  data_source TEXT, -- 'linkedin', 'indeed', 'glassdoor', 'manual'
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store skill demand correlations and market insights
CREATE TABLE IF NOT EXISTS public."SkillMarketAnalytics" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  category TEXT,
  demand_score INTEGER CHECK (demand_score >= 0 AND demand_score <= 100), -- Overall market demand
  growth_velocity DECIMAL(5,2), -- Month-over-month growth percentage
  market_saturation DECIMAL(5,2), -- How saturated the market is (0-100)
  skill_combinations JSONB DEFAULT '[]'::jsonb, -- High-value skill combinations
  industry_demand JSONB DEFAULT '{}'::jsonb, -- Demand by industry
  geographic_hotspots JSONB DEFAULT '[]'::jsonb, -- Top locations for this skill
  career_progression_value INTEGER CHECK (career_progression_value >= 0 AND career_progression_value <= 100),
  automation_risk DECIMAL(5,2) CHECK (automation_risk >= 0 AND automation_risk <= 100),
  learning_roi_score INTEGER CHECK (learning_roi_score >= 0 AND learning_roi_score <= 100),
  market_predictions JSONB DEFAULT '{}'::jsonb, -- Future market predictions
  last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store career ROI calculations and insights
CREATE TABLE IF NOT EXISTS public."CareerROIAnalysis" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id INTEGER, -- Reference to ingenieurs.ingenieur_id
  skill_name TEXT NOT NULL,
  current_market_value INTEGER, -- Current salary potential
  projected_market_value INTEGER, -- Projected salary after learning
  learning_investment_hours INTEGER,
  learning_cost_estimate DECIMAL(10,2),
  time_to_proficiency_months INTEGER,
  roi_percentage DECIMAL(8,2), -- Return on investment percentage
  payback_period_months INTEGER, -- How long to recoup investment
  risk_factors JSONB DEFAULT '[]'::jsonb,
  market_confidence_score INTEGER CHECK (market_confidence_score >= 0 AND market_confidence_score <= 100),
  geographic_variance JSONB DEFAULT '{}'::jsonb, -- ROI variance by location
  career_advancement_potential TEXT,
  recommendation_strength TEXT CHECK (recommendation_strength IN ('high', 'medium', 'low', 'avoid')),
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store geographic market intelligence
CREATE TABLE IF NOT EXISTS public."GeographicMarketData" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL, -- City, State/Country
  country_code TEXT,
  cost_of_living_index DECIMAL(8,2),
  tech_ecosystem_score INTEGER CHECK (tech_ecosystem_score >= 0 AND tech_ecosystem_score <= 100),
  startup_density INTEGER, -- Number of startups per 100k population
  average_tech_salary INTEGER,
  remote_work_adoption DECIMAL(5,2), -- Percentage of companies offering remote work
  skill_gaps JSONB DEFAULT '[]'::jsonb, -- Most in-demand skills not being filled
  growth_trends JSONB DEFAULT '{}'::jsonb, -- Historical growth data
  visa_requirements JSONB DEFAULT '{}'::jsonb, -- For international talent
  tax_implications JSONB DEFAULT '{}'::jsonb,
  quality_of_life_score INTEGER CHECK (quality_of_life_score >= 0 AND quality_of_life_score <= 100),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store market timing intelligence
CREATE TABLE IF NOT EXISTS public."MarketTimingInsights" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_or_trend TEXT NOT NULL,
  market_phase TEXT CHECK (market_phase IN ('emerging', 'growth', 'maturity', 'decline', 'disruption')),
  optimal_entry_timing TEXT, -- "now", "6_months", "1_year", etc.
  market_saturation_timeline JSONB DEFAULT '{}'::jsonb,
  adoption_curve_position DECIMAL(5,2), -- Where on the adoption curve (0-100)
  competitive_intensity INTEGER CHECK (competitive_intensity >= 0 AND competitive_intensity <= 100),
  learning_window_urgency TEXT CHECK (learning_window_urgency IN ('critical', 'high', 'medium', 'low')),
  market_disruption_risk DECIMAL(5,2),
  historical_patterns JSONB DEFAULT '[]'::jsonb,
  expert_sentiment JSONB DEFAULT '{}'::jsonb,
  social_signals JSONB DEFAULT '{}'::jsonb, -- Social media trends, searches, etc.
  investment_activity JSONB DEFAULT '{}'::jsonb, -- VC funding, acquisitions
  analysis_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store skill combination market value
CREATE TABLE IF NOT EXISTS public."SkillCombinationValue" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_combination JSONB NOT NULL, -- Array of skills
  combination_hash TEXT UNIQUE, -- Hash of sorted skill names for uniqueness
  market_premium_percentage DECIMAL(5,2), -- Salary premium for this combination
  job_availability_score INTEGER CHECK (job_availability_score >= 0 AND job_availability_score <= 100),
  companies_demanding JSONB DEFAULT '[]'::jsonb,
  typical_roles JSONB DEFAULT '[]'::jsonb,
  experience_levels JSONB DEFAULT '[]'::jsonb,
  geographic_demand JSONB DEFAULT '{}'::jsonb,
  trend_direction TEXT CHECK (trend_direction IN ('rising', 'stable', 'declining')),
  last_analyzed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for all new market intelligence tables
ALTER TABLE public."MarketJobData" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SkillMarketAnalytics" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."CareerROIAnalysis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."GeographicMarketData" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."MarketTimingInsights" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SkillCombinationValue" ENABLE ROW LEVEL SECURITY;

-- Create policies for market intelligence tables (read-only for most users)
CREATE POLICY "Allow reading market job data" 
ON public."MarketJobData" FOR SELECT 
USING (true);

CREATE POLICY "Allow market job data management" 
ON public."MarketJobData" FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Allow reading skill market analytics" 
ON public."SkillMarketAnalytics" FOR SELECT 
USING (true);

CREATE POLICY "Allow skill market analytics management" 
ON public."SkillMarketAnalytics" FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Allow reading career ROI analysis" 
ON public."CareerROIAnalysis" FOR SELECT 
USING (true);

CREATE POLICY "Allow career ROI analysis management" 
ON public."CareerROIAnalysis" FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Allow reading geographic market data" 
ON public."GeographicMarketData" FOR SELECT 
USING (true);

CREATE POLICY "Allow geographic market data management" 
ON public."GeographicMarketData" FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Allow reading market timing insights" 
ON public."MarketTimingInsights" FOR SELECT 
USING (true);

CREATE POLICY "Allow market timing insights management" 
ON public."MarketTimingInsights" FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Allow reading skill combination value" 
ON public."SkillCombinationValue" FOR SELECT 
USING (true);

CREATE POLICY "Allow skill combination value management" 
ON public."SkillCombinationValue" FOR ALL
USING (auth.role() = 'service_role');

-- Create indexes for optimal query performance
CREATE INDEX IF NOT EXISTS market_job_data_skill_location_idx ON public."MarketJobData" (skill_name, location);
CREATE INDEX IF NOT EXISTS market_job_data_updated_idx ON public."MarketJobData" (last_updated);
CREATE INDEX IF NOT EXISTS market_job_data_experience_idx ON public."MarketJobData" (experience_level);

CREATE INDEX IF NOT EXISTS skill_market_analytics_skill_idx ON public."SkillMarketAnalytics" (skill_name);
CREATE INDEX IF NOT EXISTS skill_market_analytics_demand_idx ON public."SkillMarketAnalytics" (demand_score DESC);
CREATE INDEX IF NOT EXISTS skill_market_analytics_roi_idx ON public."SkillMarketAnalytics" (learning_roi_score DESC);

CREATE INDEX IF NOT EXISTS career_roi_engineer_idx ON public."CareerROIAnalysis" (engineer_id);
CREATE INDEX IF NOT EXISTS career_roi_skill_idx ON public."CareerROIAnalysis" (skill_name);
CREATE INDEX IF NOT EXISTS career_roi_score_idx ON public."CareerROIAnalysis" (roi_percentage DESC);

CREATE INDEX IF NOT EXISTS geographic_market_location_idx ON public."GeographicMarketData" (location);
CREATE INDEX IF NOT EXISTS geographic_market_ecosystem_idx ON public."GeographicMarketData" (tech_ecosystem_score DESC);

CREATE INDEX IF NOT EXISTS market_timing_skill_idx ON public."MarketTimingInsights" (skill_or_trend);
CREATE INDEX IF NOT EXISTS market_timing_phase_idx ON public."MarketTimingInsights" (market_phase);
CREATE INDEX IF NOT EXISTS market_timing_urgency_idx ON public."MarketTimingInsights" (learning_window_urgency);

CREATE INDEX IF NOT EXISTS skill_combination_hash_idx ON public."SkillCombinationValue" (combination_hash);
CREATE INDEX IF NOT EXISTS skill_combination_premium_idx ON public."SkillCombinationValue" (market_premium_percentage DESC);

-- Add functions for market intelligence calculations
CREATE OR REPLACE FUNCTION calculate_skill_roi(
  skill_name_param TEXT,
  current_salary INTEGER,
  location_param TEXT DEFAULT 'Global'
) RETURNS TABLE (
  projected_salary INTEGER,
  roi_percentage DECIMAL,
  payback_months INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(mjd.avg_salary_max, current_salary + 20000) as projected_salary,
    CASE 
      WHEN current_salary > 0 THEN 
        ((COALESCE(mjd.avg_salary_max, current_salary + 20000) - current_salary)::DECIMAL / current_salary * 100)
      ELSE 0::DECIMAL
    END as roi_percentage,
    CASE 
      WHEN COALESCE(mjd.avg_salary_max, current_salary + 20000) > current_salary THEN 
        GREATEST(6, (20000 / ((COALESCE(mjd.avg_salary_max, current_salary + 20000) - current_salary) / 12)))::INTEGER
      ELSE 12
    END as payback_months
  FROM public."MarketJobData" mjd
  WHERE mjd.skill_name = skill_name_param
    AND (mjd.location = location_param OR location_param = 'Global')
  ORDER BY mjd.last_updated DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql; 

-- Delivery Manager Portal Tables

-- Create profilers table for candidate database
CREATE TABLE IF NOT EXISTS public.profilers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'unavailable')),
  preferred_work_arrangement TEXT[] DEFAULT '{}',
  skills JSONB DEFAULT '[]',
  experience_level TEXT,
  years_of_experience INTEGER,
  hourly_rate DECIMAL(10,2),
  daily_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  bio TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT,
  certifications JSONB DEFAULT '[]',
  languages JSONB DEFAULT '[]',
  preferred_industries JSONB DEFAULT '[]',
  contract_types TEXT[] DEFAULT '{}',
  notice_period_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create placements table for tracking ticket-to-profiler assignments
CREATE TABLE IF NOT EXISTS public.placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  profiler_id UUID NOT NULL REFERENCES public.profilers(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'proposed' CHECK (status IN ('proposed', 'interviewing', 'accepted', 'rejected', 'placed', 'completed', 'cancelled')),
  match_score DECIMAL(3,2), -- 0.00 to 1.00
  notes TEXT,
  interview_scheduled_at TIMESTAMP WITH TIME ZONE,
  start_date DATE,
  end_date DATE,
  placement_fee DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create availability_calendar table for detailed availability tracking
CREATE TABLE IF NOT EXISTS public.availability_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profiler_id UUID NOT NULL REFERENCES public.profilers(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'blocked', 'vacation')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create placement_history table for tracking placement outcomes
CREATE TABLE IF NOT EXISTS public.placement_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement_id UUID NOT NULL REFERENCES public.placements(id) ON DELETE CASCADE,
  status_changed_to TEXT NOT NULL,
  changed_by UUID REFERENCES public.users(id),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profilers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profilers
CREATE POLICY "Allow reading profilers" 
ON public.profilers FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage profilers" 
ON public.profilers FOR ALL
USING (auth.role() = 'service_role');

-- RLS Policies for placements
CREATE POLICY "Allow reading placements" 
ON public.placements FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage placements" 
ON public.placements FOR ALL
USING (auth.role() = 'service_role');

-- RLS Policies for availability_calendar
CREATE POLICY "Allow reading availability calendar" 
ON public.availability_calendar FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage availability calendar" 
ON public.availability_calendar FOR ALL
USING (auth.role() = 'service_role');

-- RLS Policies for placement_history
CREATE POLICY "Allow reading placement history" 
ON public.placement_history FOR SELECT 
USING (true);

CREATE POLICY "Allow service role to manage placement history" 
ON public.placement_history FOR ALL
USING (auth.role() = 'service_role');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS profilers_email_idx ON public.profilers (email);
CREATE INDEX IF NOT EXISTS profilers_availability_status_idx ON public.profilers (availability_status);
CREATE INDEX IF NOT EXISTS profilers_experience_level_idx ON public.profilers (experience_level);
CREATE INDEX IF NOT EXISTS profilers_location_idx ON public.profilers (location);
CREATE INDEX IF NOT EXISTS profilers_skills_idx ON public.profilers USING GIN (skills);

CREATE INDEX IF NOT EXISTS placements_ticket_id_idx ON public.placements (ticket_id);
CREATE INDEX IF NOT EXISTS placements_profiler_id_idx ON public.placements (profiler_id);
CREATE INDEX IF NOT EXISTS placements_status_idx ON public.placements (status);
CREATE INDEX IF NOT EXISTS placements_assigned_by_idx ON public.placements (assigned_by);
CREATE INDEX IF NOT EXISTS placements_match_score_idx ON public.placements (match_score DESC);

CREATE INDEX IF NOT EXISTS availability_profiler_id_idx ON public.availability_calendar (profiler_id);
CREATE INDEX IF NOT EXISTS availability_date_range_idx ON public.availability_calendar (start_date, end_date);
CREATE INDEX IF NOT EXISTS availability_status_idx ON public.availability_calendar (status);

CREATE INDEX IF NOT EXISTS placement_history_placement_id_idx ON public.placement_history (placement_id);
CREATE INDEX IF NOT EXISTS placement_history_changed_by_idx ON public.placement_history (changed_by);
CREATE INDEX IF NOT EXISTS placement_history_created_at_idx ON public.placement_history (created_at);

-- Helper function to calculate match score between profiler skills and ticket requirements
CREATE OR REPLACE FUNCTION calculate_profiler_match_score(
  profiler_skills JSONB,
  required_skills TEXT[],
  preferred_skills TEXT[]
) RETURNS DECIMAL(3,2) AS $$
DECLARE
  total_requirements INTEGER;
  matched_requirements INTEGER;
  required_match INTEGER := 0;
  preferred_match INTEGER := 0;
  skill TEXT;
  profiler_skill_names TEXT[];
BEGIN
  -- Extract skill names from profiler skills JSONB
  SELECT array_agg(skill_data->>'name') INTO profiler_skill_names
  FROM jsonb_array_elements(profiler_skills) AS skill_data;
  
  -- Count matches in required skills
  FOREACH skill IN ARRAY required_skills LOOP
    IF skill = ANY(profiler_skill_names) THEN
      required_match := required_match + 1;
    END IF;
  END LOOP;
  
  -- Count matches in preferred skills
  FOREACH skill IN ARRAY preferred_skills LOOP
    IF skill = ANY(profiler_skill_names) THEN
      preferred_match := preferred_match + 1;
    END IF;
  END LOOP;
  
  total_requirements := array_length(required_skills, 1) + array_length(preferred_skills, 1);
  matched_requirements := required_match + preferred_match;
  
  -- Weight required skills more heavily (70% for required, 30% for preferred)
  IF total_requirements > 0 THEN
    RETURN LEAST(1.0, 
      (required_match::DECIMAL / GREATEST(array_length(required_skills, 1), 1) * 0.7) +
      (preferred_match::DECIMAL / GREATEST(array_length(preferred_skills, 1), 1) * 0.3)
    );
  ELSE
    RETURN 0.0;
  END IF;
END;
$$ LANGUAGE plpgsql; 