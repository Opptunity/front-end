import { 
  MarketIntelligenceDashboard, 
  CareerROIAnalysis,
  SkillMarketAnalytics,
  MarketTimingInsights,
  SkillCombinationValue,
  GeographicMarketData,
  MarketJobData,
  MarketIntelligenceRequest,
  MarketIntelligenceResponse
} from '@/lib/types/engineer-ranking'

// Base URL for market intelligence API
const API_BASE = '/api/market-intelligence'

/**
 * Market Intelligence API Client
 * Provides convenient methods for fetching market intelligence data
 */
export class MarketIntelligenceClient {
  
  /**
   * Fetch comprehensive market intelligence dashboard for an engineer
   */
  static async getDashboard(
    engineerId: number, 
    location?: string
  ): Promise<MarketIntelligenceDashboard> {
    const params = new URLSearchParams({
      type: 'dashboard',
      engineer_id: engineerId.toString(),
    })
    
    if (location) {
      params.append('location', location)
    }

    const response = await fetch(`${API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market intelligence dashboard: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Get job market data for a specific skill and location
   */
  static async getJobMarketData(
    skill?: string, 
    location?: string
  ): Promise<{ job_market_data: MarketJobData[]; total_count: number; last_updated: string }> {
    const params = new URLSearchParams({ type: 'job-data' })
    
    if (skill) params.append('skill', skill)
    if (location) params.append('location', location)

    const response = await fetch(`${API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job market data: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Get skill market analytics
   */
  static async getSkillAnalytics(
    skill?: string
  ): Promise<{ skill_analytics: SkillMarketAnalytics[]; top_skills: SkillMarketAnalytics[]; last_analyzed: string }> {
    const params = new URLSearchParams({ type: 'analytics' })
    
    if (skill) params.append('skill', skill)

    const response = await fetch(`${API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch skill analytics: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Get career ROI analysis for a specific engineer and skill
   */
  static async getROIAnalysis(
    engineerId: number, 
    skill: string, 
    location?: string
  ): Promise<{ roi_analysis: CareerROIAnalysis; is_cached?: boolean }> {
    const params = new URLSearchParams({
      type: 'roi',
      engineer_id: engineerId.toString(),
      skill
    })
    
    if (location) params.append('location', location)

    const response = await fetch(`${API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ROI analysis: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Get geographic market data
   */
  static async getGeographicData(
    location?: string
  ): Promise<{ geographic_data: GeographicMarketData[]; top_locations: GeographicMarketData[]; last_updated: string }> {
    const params = new URLSearchParams({ type: 'geographic' })
    
    if (location) params.append('location', location)

    const response = await fetch(`${API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch geographic data: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Get market timing insights
   */
  static async getTimingInsights(
    skill?: string
  ): Promise<{ timing_insights: MarketTimingInsights[]; critical_timing: MarketTimingInsights[]; last_analyzed: string }> {
    const params = new URLSearchParams({ type: 'timing' })
    
    if (skill) params.append('skill', skill)

    const response = await fetch(`${API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch timing insights: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Get skill combination value analysis
   */
  static async getSkillCombinations(
    skill?: string
  ): Promise<{ skill_combinations: SkillCombinationValue[]; high_value_combinations: SkillCombinationValue[]; last_analyzed: string }> {
    const params = new URLSearchParams({ type: 'skill-combinations' })
    
    if (skill) params.append('skill', skill)

    const response = await fetch(`${API_BASE}?${params}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch skill combinations: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Generate market analysis for a skill
   */
  static async generateMarketAnalysis(
    skillName: string, 
    location: string = 'Global'
  ): Promise<{ market_analysis: SkillMarketAnalytics; saved_to_db: boolean; generated_at: string }> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_market_analysis',
        skill_name: skillName,
        location
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to generate market analysis: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Calculate ROI for a skill
   */
  static async calculateROI(
    engineerId: number,
    skillName: string,
    currentSalary?: number,
    location: string = 'Global'
  ): Promise<{ roi_analysis: CareerROIAnalysis; saved_to_db: boolean; calculated_at: string }> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'calculate_roi',
        engineer_id: engineerId,
        skill_name: skillName,
        current_salary: currentSalary,
        location
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to calculate ROI: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Analyze skill combinations
   */
  static async analyzeSkillCombinations(
    skills: string[]
  ): Promise<{ combination_analysis: SkillCombinationValue; saved_to_db: boolean; analyzed_at: string }> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'analyze_skill_combinations',
        skills
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to analyze skill combinations: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Generate timing insights for a skill or trend
   */
  static async generateTimingInsights(
    skillOrTrend: string
  ): Promise<{ timing_insights: MarketTimingInsights; saved_to_db: boolean; analyzed_at: string }> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_timing_insights',
        skill_or_trend: skillOrTrend
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to generate timing insights: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Update market data (for external integrations)
   */
  static async updateMarketData(
    data: Partial<MarketJobData>[]
  ): Promise<{ updated_records: number; data: MarketJobData[]; updated_at: string }> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update_market_data',
        ...data
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update market data: ${response.statusText}`)
    }
    
    return response.json()
  }
}

/**
 * Convenience functions for common operations
 */

/**
 * Get top ROI opportunities for an engineer
 */
export async function getTopROIOpportunities(
  engineerId: number, 
  location?: string,
  limit: number = 5
): Promise<CareerROIAnalysis[]> {
  const dashboard = await MarketIntelligenceClient.getDashboard(engineerId, location)
  return dashboard.roi_opportunities.slice(0, limit)
}

/**
 * Get critical timing skills that need immediate attention
 */
export async function getCriticalTimingSkills(
  limit: number = 10
): Promise<MarketTimingInsights[]> {
  const result = await MarketIntelligenceClient.getTimingInsights()
  return result.critical_timing.slice(0, limit)
}

/**
 * Get market premium for skill combinations an engineer can form
 */
export async function getEngineerSkillCombinations(
  engineerId: number,
  location?: string
): Promise<SkillCombinationValue[]> {
  const dashboard = await MarketIntelligenceClient.getDashboard(engineerId, location)
  return dashboard.skill_combinations
}

/**
 * Get market overview for a specific skill
 */
export async function getSkillMarketOverview(skill: string) {
  const [analytics, timing, combinations] = await Promise.all([
    MarketIntelligenceClient.getSkillAnalytics(skill),
    MarketIntelligenceClient.getTimingInsights(skill),
    MarketIntelligenceClient.getSkillCombinations(skill)
  ])

  return {
    analytics: analytics.skill_analytics[0],
    timing: timing.timing_insights[0],
    combinations: combinations.skill_combinations
  }
}

/**
 * Bulk generate analysis for multiple skills
 */
export async function bulkGenerateAnalysis(
  skills: string[],
  location: string = 'Global'
): Promise<{
  successful: string[];
  failed: string[];
  results: any[];
}> {
  const results = []
  const successful = []
  const failed = []

  for (const skill of skills) {
    try {
      const result = await MarketIntelligenceClient.generateMarketAnalysis(skill, location)
      results.push(result)
      successful.push(skill)
    } catch (error) {
      console.error(`Failed to analyze ${skill}:`, error)
      failed.push(skill)
    }
    
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return { successful, failed, results }
}

/**
 * Get personalized learning recommendations based on market intelligence
 */
export async function getPersonalizedLearningRecommendations(
  engineerId: number,
  location?: string,
  preferences?: {
    timeAvailable?: number; // hours per week
    careerGoals?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
  }
) {
  const dashboard = await MarketIntelligenceClient.getDashboard(engineerId, location)
  
  // Sort recommendations by multiple factors
  const recommendations = dashboard.roi_opportunities
    .filter(roi => {
      // Filter based on preferences
      if (preferences?.riskTolerance === 'low' && roi.recommendation_strength === 'avoid') {
        return false
      }
      return true
    })
    .sort((a, b) => {
      // Prioritize by ROI, confidence, and urgency
      const scoreA = a.roi_percentage * (a.market_confidence_score / 100)
      const scoreB = b.roi_percentage * (b.market_confidence_score / 100)
      return scoreB - scoreA
    })
    .slice(0, 10)

  return {
    recommendations,
    urgent_skills: dashboard.recommendations.urgent_learning,
    valuable_combinations: dashboard.recommendations.valuable_combinations,
    market_summary: dashboard.market_summary
  }
} 