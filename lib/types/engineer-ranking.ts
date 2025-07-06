// Types pour le système de classement d'ingénieurs

export interface Competence {
  competence_id: string;
  nom_competence: string;
  categorie?: string;
}

export interface Ingenieur {
  ingenieur_id: string;
  nom: string;
  prenom: string;
  email: string;
  equipe_id?: string;
  adresse_residence?: string;
  competences?: IngenieurCompetence[];
  disponibilite?: IngenieurDisponibilite;
}

export interface IngenieurDisponibilite {
  statut_disponibilite: string;
  disponibilite_effective: number;
  allocation_totale: number;
  projets_prioritaires: Array<{
    nom_projet: string;
    priorite: string;
    allocation_pourcentage: number;
  }>;
  absences_actuelles: Array<{
    type_absence: string;
    date_debut: string;
    date_fin: string;
    description?: string;
  }>;
}

export interface IngenieurCompetence {
  ingenieur_id: string;
  competence_id: string;
  competence?: Competence;
  niveau: number; // 1-5
}

export interface TacheAnalysee {
  nom: string;
  description: string;
  type?: string; // frontend, backend, devops, mobile, etc.
  complexite: number;
  priorite?: number;
  peut_commencer_immediatement?: boolean;
  dependances?: string[];
  competences_cles: string[];
  estimation_jours: number;
  assignable_en_parallele?: boolean;
  workstream?: string;
  workstream_info?: {
    peut_demarrer_jour_1: boolean;
    equipe_recommandee: number;
    description_workstream: string;
  };
}

export interface Tache {
  tache_id: string;
  projet_id?: string;
  nom_tache: string;
  description_tache?: string;
  statut_tache?: string;
  priorite?: number;
  competences_requises?: TacheCompetenceRequise[];
}

export interface TacheCompetenceRequise {
  tache_id: string;
  competence_id: string;
  competence?: Competence;
  niveau_requis: number; // 1-5
  importance: number; // 1-5
}

export interface ClassementAI {
  id: string;
  tache_id: string;
  ingenieur_id: string;
  ingenieur?: Ingenieur;
  tache?: Tache;
  score_compatibilite: number; // 0-100
  rang: number;
  justification_ai: string;
  disponibilite_impact?: string;
  competences_manquantes: Competence[];
  competences_adequates: IngenieurCompetence[];
  recommandations: string;
  created_at: string;
}

export interface ClassementRequest {
  mode?: 'project_decomposition' | 'task_specific' | 'job_specification';
  
  // Mode décomposition de projet
  projet_description?: string;
  projet_nom?: string;
  
  // Mode job specification (nouveau)
  job_specification?: string;
  
  // Mode tâche spécifique (existant)
  tache_id?: string;
  tache_description?: string;
  competences_requises?: {
    competence_id?: string;
    nom_competence?: string;
    niveau_requis: number;
    importance: number;
  }[];
  
  limite_resultats?: number;
}

export interface ProjectRankingResponse {
  projet_description: string;
  taches_identifiees: number;
  workstreams_paralleles?: Array<{
    nom_workstream: string;
    peut_demarrer_jour_1: boolean;
    equipe_recommandee: number;
    description_workstream: string;
    taches_simultanees: TacheAnalysee[];
  }>;
  synchronisation_points?: Array<{
    jour: number;
    description: string;
  }>;
  classements_par_tache: Array<{
    tache: TacheAnalysee & {
      workstream?: string;
      workstream_info?: {
        peut_demarrer_jour_1: boolean;
        equipe_recommandee: number;
        description_workstream: string;
      };
    };
    classements: ClassementAI[];
  }>;
  resume_global: string;
}

export interface JobSpecificationResponse {
  job_specification: string;
  job_analysis: JobAnalysis;
  nombre_ingenieurs_evalues: number;
  classements: ClassementAI[];
  resume_job_matching: string;
}

export interface JobAnalysis {
  position_title: string;
  seniority_level: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
  engagement_duration: string;
  start_urgency: string;
  location_requirements: {
    city?: string;
    country?: string;
    work_model?: 'remote' | 'hybrid' | 'on-site';
    office_days?: number;
    remote_days?: number;
    relocation_required?: boolean;
  };
  technical_requirements: {
    must_have: Array<{
      skill: string;
      importance: number;
      experience_level: string;
    }>;
    preferred: Array<{
      skill: string;
      importance: number;
      experience_level: string;
    }>;
  };
  domain_expertise?: string;
  key_technologies: string[];
  availability_requirements: {
    start_date: string;
    commitment_level: string;
    duration_months?: number;
  };
}

export interface ClassementResponse {
  classements: ClassementAI[];
  tache_analysee: Tache;
  nombre_ingenieurs_evalues: number;
  temps_traitement: number;
} 

// ================================
// ONBOARDING TYPES
// ================================

export interface OnboardingProfile {
  id: string;
  engineer_id: string;
  personal_info: {
    full_name: string;
    email: string;
    role: string;
    department: string;
    start_date: string;
    location: string;
    manager_email?: string;
  };
  technical_background: {
    experience_level: 'junior' | 'mid' | 'senior' | 'lead' | 'principal';
    years_experience: number;
    primary_technologies: string[];
    previous_companies: string[];
    education_background: string;
  };
  current_skills: {
    skill_id: string;
    skill_name: string;
    self_assessed_level: number; // 1-5
    category: string;
    is_primary: boolean;
  }[];
  learning_goals: {
    goal_id: string;
    skill_area: string;
    target_level: number;
    priority: 'high' | 'medium' | 'low';
    timeline: string;
    reason: string;
  }[];
  team_preferences: {
    preferred_work_style: 'individual' | 'collaborative' | 'mixed';
    communication_style: 'direct' | 'diplomatic' | 'casual';
    learning_style: 'hands_on' | 'documentation' | 'mentorship' | 'mixed';
    availability_for_mentoring: boolean;
  };
  onboarding_status: {
    current_step: number;
    completed_steps: number[];
    started_at: string;
    completed_at?: string;
    is_completed: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  step_number: number;
  title: string;
  description: string;
  is_required: boolean;
  estimated_time_minutes: number;
  resources: OnboardingResource[];
}

export interface OnboardingResource {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'course' | 'meeting';
  url?: string;
  description: string;
  is_required: boolean;
  estimated_time_minutes?: number;
}

export interface OnboardingTask {
  id: string;
  engineer_id: string;
  title: string;
  description: string;
  type: 'skill_assessment' | 'goal_setting' | 'team_meeting' | 'training' | 'documentation';
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  priority: 'high' | 'medium' | 'low';
  due_date?: string;
  assigned_by?: string;
  completed_at?: string;
  notes?: string;
  resources?: OnboardingResource[];
}

export interface OnboardingProgress {
  engineer_id: string;
  overall_progress: number; // 0-100
  steps_completed: number;
  total_steps: number;
  current_phase: 'welcome' | 'assessment' | 'goals' | 'team_intro' | 'resources' | 'completed';
  estimated_completion_date: string;
  tasks_pending: number;
  tasks_completed: number;
  weekly_milestones: {
    week: number;
    goals: string[];
    completed: boolean;
    completion_date?: string;
  }[];
}

export interface TeamIntroduction {
  engineer_id: string;
  team_members: {
    member_id: string;
    name: string;
    role: string;
    experience_level: string;
    skills_overlap: string[];
    introduction_completed: boolean;
    mentor_assigned?: boolean;
  }[];
  assigned_mentor?: {
    mentor_id: string;
    name: string;
    role: string;
    expertise_areas: string[];
    meeting_scheduled: boolean;
    meeting_date?: string;
  };
  team_projects: {
    project_id: string;
    project_name: string;
    description: string;
    role_in_project: string;
    start_date: string;
    technologies_used: string[];
  }[];
}

export interface OnboardingAnalytics {
  engineer_id: string;
  completion_rate: number;
  time_to_productivity: number; // days
  engagement_score: number; // 0-100
  skill_development_pace: number;
  areas_of_interest: string[];
  recommended_next_steps: string[];
  manager_feedback?: {
    rating: number;
    comments: string;
    areas_for_improvement: string[];
  };
} 

// ================================
// ENGINEER-TREND INTEGRATION TYPES
// ================================

export interface EngineerTrendFocus {
  id: string;
  engineer_id: number;
  trend_id: string;
  trend_name: string;
  focus_reason?: string;
  priority_level: 'high' | 'medium' | 'low';
  target_completion_date?: string;
  current_progress: number; // 0-100
  status: 'active' | 'paused' | 'completed' | 'dropped';
  notes?: string;
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  // Related data
  progress_details?: EngineerTrendProgress[];
  learning_activities?: EngineerLearningActivity[];
  related_goals?: EngineerTrendGoal[];
}

export interface EngineerTrendProgress {
  id: string;
  engineer_trend_focus_id: string;
  skill_name: string;
  skill_category?: string;
  current_level: number; // 1-5
  target_level: number; // 1-5
  learning_resources_completed: {
    resource_id: string;
    resource_title: string;
    resource_type: string;
    completed_at: string;
    time_spent_hours: number;
  }[];
  time_invested_hours: number;
  last_practiced_at?: string;
  proficiency_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EngineerTrendRecommendation {
  id: string;
  engineer_id: number;
  trend_id: string;
  trend_name: string;
  relevance_score: number; // 0-100
  recommendation_reason: string;
  market_alignment_score: number; // 0-100
  skill_gap_analysis: {
    missing_skills: string[];
    weak_skills: string[];
    related_skills: string[];
    skill_overlap_percentage: number;
  };
  estimated_learning_time: string;
  career_impact_score: number; // 0-100
  is_dismissed: boolean;
  recommended_at: string;
  created_at: string;
  updated_at: string;
}

export interface EngineerLearningActivity {
  id: string;
  engineer_id: number;
  trend_id?: string;
  activity_type: 'course_completed' | 'certification_earned' | 'project_built' | 'resource_read' | 'skill_practiced' | 'goal_achieved';
  activity_title: string;
  activity_description?: string;
  activity_url?: string;
  provider?: string;
  completion_percentage: number; // 0-100
  time_spent_hours?: number;
  skills_gained: string[];
  achievement_proof_url?: string;
  activity_date: string;
  created_at: string;
}

export interface EngineerTrendGoal {
  id: string;
  engineer_id: number;
  trend_id: string;
  goal_title: string;
  goal_description?: string;
  goal_type: 'skill_acquisition' | 'certification' | 'project_completion' | 'career_transition' | 'knowledge_update';
  target_skills: string[];
  success_criteria?: string;
  target_date?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'in_progress' | 'completed' | 'deferred' | 'cancelled';
  progress_percentage: number; // 0-100
  milestones: {
    milestone_id: string;
    title: string;
    description: string;
    target_date: string;
    status: 'pending' | 'completed';
    completed_at?: string;
  }[];
  resources_needed: {
    resource_type: string;
    resource_title: string;
    resource_url?: string;
    estimated_cost?: number;
    priority: 'high' | 'medium' | 'low';
  }[];
  mentor_assigned?: string;
  created_at: string;
  updated_at: string;
}

export interface EngineerTrendDashboard {
  engineer_id: number;
  engineer_info: {
    name: string;
    email: string;
    current_skills: string[];
    professional_field?: string;
    experience_level: string;
  };
  active_trends: EngineerTrendFocus[];
  recommendations: EngineerTrendRecommendation[];
  recent_activities: EngineerLearningActivity[];
  learning_goals: EngineerTrendGoal[];
  progress_summary: {
    total_active_trends: number;
    completed_trends: number;
    total_learning_hours: number;
    skills_gained_this_month: number;
    next_milestones: {
      trend_name: string;
      milestone_title: string;
      due_date: string;
    }[];
  };
  skill_development_chart: {
    skill_name: string;
    current_level: number;
    target_level: number;
    progress_percentage: number;
    trend_id: string;
  }[];
}

export interface TrendFocusRequest {
  engineer_id: number;
  trend_id: string;
  trend_name: string;
  focus_reason?: string;
  priority_level: 'high' | 'medium' | 'low';
  target_completion_date?: string;
  selected_skills?: string[]; // Skills from the trend they want to focus on
  learning_goals?: {
    skill_name: string;
    current_level: number;
    target_level: number;
  }[];
}

export interface TrendRecommendationRequest {
  engineer_id: number;
  current_skills?: string[];
  career_goals?: string[];
  industry_preference?: string;
  experience_level?: string;
  time_availability?: number; // hours per week
  include_emerging_trends?: boolean;
}

export interface LearningActivityRequest {
  engineer_id: number;
  trend_id?: string;
  activity_type: 'course_completed' | 'certification_earned' | 'project_built' | 'resource_read' | 'skill_practiced' | 'goal_achieved';
  activity_title: string;
  activity_description?: string;
  activity_url?: string;
  provider?: string;
  completion_percentage?: number;
  time_spent_hours?: number;
  skills_gained?: string[];
  achievement_proof_url?: string;
}

// ================================
// ENHANCED MARKET INTELLIGENCE TYPES
// ================================

export interface MarketJobData {
  id: string;
  skill_name: string;
  location: string;
  job_count: number;
  avg_salary_min: number;
  avg_salary_max: number;
  currency: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  remote_percentage: number;
  top_companies: string[];
  trending_keywords: string[];
  data_source: string;
  last_updated: string;
  created_at: string;
}

export interface SkillMarketAnalytics {
  id: string;
  skill_name: string;
  category: string;
  demand_score: number; // 0-100
  growth_velocity: number; // Monthly percentage growth
  market_saturation: number; // 0-100
  skill_combinations: string[][];
  industry_demand: Record<string, number>;
  geographic_hotspots: { location: string; demand_score: number }[];
  career_progression_value: number; // 0-100
  automation_risk: number; // 0-100
  learning_roi_score: number; // 0-100
  market_predictions: Record<string, any>;
  last_analyzed: string;
  created_at: string;
}

export interface CareerROIAnalysis {
  id: string;
  engineer_id: number;
  skill_name: string;
  current_market_value: number;
  projected_market_value: number;
  learning_investment_hours: number;
  learning_cost_estimate: number;
  time_to_proficiency_months: number;
  roi_percentage: number;
  payback_period_months: number;
  risk_factors: string[];
  market_confidence_score: number; // 0-100
  geographic_variance: Record<string, number>;
  career_advancement_potential: string;
  recommendation_strength: 'high' | 'medium' | 'low' | 'avoid';
  analysis_date: string;
  created_at: string;
}

export interface GeographicMarketData {
  id: string;
  location: string;
  country_code: string;
  cost_of_living_index: number;
  tech_ecosystem_score: number; // 0-100
  startup_density: number;
  average_tech_salary: number;
  remote_work_adoption: number; // Percentage
  skill_gaps: string[];
  growth_trends: Record<string, any>;
  visa_requirements: Record<string, any>;
  tax_implications: Record<string, any>;
  quality_of_life_score: number; // 0-100
  last_updated: string;
  created_at: string;
}

export interface MarketTimingInsights {
  id: string;
  skill_or_trend: string;
  market_phase: 'emerging' | 'growth' | 'maturity' | 'decline' | 'disruption';
  optimal_entry_timing: string;
  market_saturation_timeline: Record<string, any>;
  adoption_curve_position: number; // 0-100
  competitive_intensity: number; // 0-100
  learning_window_urgency: 'critical' | 'high' | 'medium' | 'low';
  market_disruption_risk: number; // 0-100
  historical_patterns: any[];
  expert_sentiment: Record<string, any>;
  social_signals: Record<string, any>;
  investment_activity: Record<string, any>;
  analysis_date: string;
  created_at: string;
}

export interface SkillCombinationValue {
  id: string;
  skill_combination: string[];
  combination_hash: string;
  market_premium_percentage: number;
  job_availability_score: number; // 0-100
  companies_demanding: string[];
  typical_roles: string[];
  experience_levels: string[];
  geographic_demand: Record<string, number>;
  trend_direction: 'rising' | 'stable' | 'declining';
  last_analyzed: string;
  created_at: string;
}

export interface MarketIntelligenceDashboard {
  engineer_id: number;
  engineer_skills: string[];
  skill_market_analytics: SkillMarketAnalytics[];
  roi_opportunities: CareerROIAnalysis[];
  skill_combinations: SkillCombinationValue[];
  timing_insights: MarketTimingInsights[];
  geographic_insights?: GeographicMarketData;
  recommendations: {
    high_roi_skills: CareerROIAnalysis[];
    urgent_learning: MarketTimingInsights[];
    valuable_combinations: SkillCombinationValue[];
  };
  market_summary: {
    total_skills_analyzed: number;
    average_demand_score: number;
    best_roi_opportunity: number;
    critical_timing_count: number;
  };
  last_updated: string;
}

export interface MarketIntelligenceRequest {
  type: 'job-data' | 'analytics' | 'roi' | 'geographic' | 'timing' | 'skill-combinations' | 'dashboard';
  skill?: string;
  location?: string;
  engineer_id?: number;
}

export interface MarketIntelligenceResponse {
  job_market_data?: MarketJobData[];
  skill_analytics?: SkillMarketAnalytics[];
  roi_analysis?: CareerROIAnalysis;
  geographic_data?: GeographicMarketData[];
  timing_insights?: MarketTimingInsights[];
  skill_combinations?: SkillCombinationValue[];
  dashboard?: MarketIntelligenceDashboard;
  total_count?: number;
  last_updated: string;
} 