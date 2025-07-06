import { NextRequest, NextResponse } from 'next/server';
import { engineerSupabase, testConnection } from '@/lib/supabase-engineer';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Types for market intelligence
export interface MarketJobData {
  skill_name: string;
  location: string;
  job_count: number;
  avg_salary_min: number;
  avg_salary_max: number;
  currency: string;
  experience_level: string;
  remote_percentage: number;
  top_companies: string[];
  trending_keywords: string[];
  data_source: string;
}

export interface SkillMarketAnalytics {
  skill_name: string;
  category: string;
  demand_score: number;
  growth_velocity: number;
  market_saturation: number;
  skill_combinations: string[][];
  industry_demand: Record<string, number>;
  geographic_hotspots: { location: string; demand_score: number }[];
  career_progression_value: number;
  automation_risk: number;
  learning_roi_score: number;
  market_predictions: Record<string, any>;
}

export interface CareerROIAnalysis {
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
  market_confidence_score: number;
  geographic_variance: Record<string, number>;
  career_advancement_potential: string;
  recommendation_strength: 'high' | 'medium' | 'low' | 'avoid';
}

export interface GeographicMarketData {
  location: string;
  country_code: string;
  cost_of_living_index: number;
  tech_ecosystem_score: number;
  startup_density: number;
  average_tech_salary: number;
  remote_work_adoption: number;
  skill_gaps: string[];
  growth_trends: Record<string, any>;
  visa_requirements: Record<string, any>;
  tax_implications: Record<string, any>;
  quality_of_life_score: number;
}

export interface MarketTimingInsights {
  skill_or_trend: string;
  market_phase: 'emerging' | 'growth' | 'maturity' | 'decline' | 'disruption';
  optimal_entry_timing: string;
  market_saturation_timeline: Record<string, any>;
  adoption_curve_position: number;
  competitive_intensity: number;
  learning_window_urgency: 'critical' | 'high' | 'medium' | 'low';
  market_disruption_risk: number;
  historical_patterns: any[];
  expert_sentiment: Record<string, any>;
  social_signals: Record<string, any>;
  investment_activity: Record<string, any>;
}

// GET - Fetch market intelligence data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'job-data', 'analytics', 'roi', 'geographic', 'timing'
    const skill = searchParams.get('skill');
    const location = searchParams.get('location');
    const engineerId = searchParams.get('engineer_id');

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    switch (type) {
      case 'job-data':
        return await getJobMarketData(skill, location);
      
      case 'analytics':
        return await getSkillMarketAnalytics(skill);
      
      case 'roi':
        if (!engineerId || !skill) {
          return NextResponse.json(
            { error: 'Engineer ID and skill are required for ROI analysis' },
            { status: 400 }
          );
        }
        return await getCareerROIAnalysis(parseInt(engineerId), skill, location);
      
      case 'geographic':
        return await getGeographicMarketData(location);
      
      case 'timing':
        return await getMarketTimingInsights(skill);
      
      case 'skill-combinations':
        return await getSkillCombinationValue(skill);
      
      case 'dashboard':
        if (!engineerId) {
          return NextResponse.json(
            { error: 'Engineer ID is required for dashboard' },
            { status: 400 }
          );
        }
        return await getMarketIntelligenceDashboard(parseInt(engineerId), location);
      
      default:
        return NextResponse.json(
          { error: 'Invalid market intelligence type' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error fetching market intelligence:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market intelligence data' },
      { status: 500 }
    );
  }
}

// POST - Generate or update market intelligence data
export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    switch (action) {
      case 'generate_market_analysis':
        return await generateMarketAnalysis(data.skill_name, data.location);
      
      case 'calculate_roi':
        return await calculateSkillROI(data.engineer_id, data.skill_name, data.current_salary, data.location);
      
      case 'analyze_skill_combinations':
        return await analyzeSkillCombinations(data.skills);
      
      case 'update_market_data':
        return await updateMarketData(data);
      
      case 'generate_timing_insights':
        return await generateTimingInsights(data.skill_or_trend);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error processing market intelligence request:', error);
    return NextResponse.json(
      { error: 'Failed to process market intelligence request' },
      { status: 500 }
    );
  }
}

// Helper function to get job market data
async function getJobMarketData(skill?: string | null, location?: string | null) {
  try {
    let query = engineerSupabase
      .from('MarketJobData')
      .select('*')
      .order('last_updated', { ascending: false });

    if (skill) {
      query = query.eq('skill_name', skill);
    }

    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query.limit(100);

    if (error) {
      throw new Error(`Failed to fetch job market data: ${error.message}`);
    }

    return NextResponse.json({
      job_market_data: data || [],
      total_count: data?.length || 0,
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    throw error;
  }
}

// Helper function to get skill market analytics
async function getSkillMarketAnalytics(skill?: string | null) {
  try {
    let query = engineerSupabase
      .from('SkillMarketAnalytics')
      .select('*')
      .order('demand_score', { ascending: false });

    if (skill) {
      query = query.eq('skill_name', skill);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      throw new Error(`Failed to fetch skill market analytics: ${error.message}`);
    }

    return NextResponse.json({
      skill_analytics: data || [],
      top_skills: data?.slice(0, 10) || [],
      last_analyzed: new Date().toISOString()
    });

  } catch (error) {
    throw error;
  }
}

// Helper function to get career ROI analysis
async function getCareerROIAnalysis(engineerId: number, skill: string, location?: string | null) {
  try {
    // Check if we have existing ROI analysis
    const { data: existingROI } = await engineerSupabase
      .from('CareerROIAnalysis')
      .select('*')
      .eq('engineer_id', engineerId)
      .eq('skill_name', skill)
      .order('analysis_date', { ascending: false })
      .limit(1);

    if (existingROI && existingROI.length > 0) {
      const analysis = existingROI[0];
      // Check if analysis is recent (within 30 days)
      const analysisDate = new Date(analysis.analysis_date);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      if (analysisDate > thirtyDaysAgo) {
        return NextResponse.json({
          roi_analysis: analysis,
          is_cached: true
        });
      }
    }

    // Generate new ROI analysis
    const newAnalysis = await calculateSkillROI(engineerId, skill, null, location || 'Global');
    return newAnalysis;

  } catch (error) {
    throw error;
  }
}

// Helper function to get geographic market data
async function getGeographicMarketData(location?: string | null) {
  try {
    let query = engineerSupabase
      .from('GeographicMarketData')
      .select('*')
      .order('tech_ecosystem_score', { ascending: false });

    if (location) {
      query = query.eq('location', location);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      throw new Error(`Failed to fetch geographic market data: ${error.message}`);
    }

    return NextResponse.json({
      geographic_data: data || [],
      top_locations: data?.slice(0, 10) || [],
      last_updated: new Date().toISOString()
    });

  } catch (error) {
    throw error;
  }
}

// Helper function to get market timing insights
async function getMarketTimingInsights(skill?: string | null) {
  try {
    let query = engineerSupabase
      .from('MarketTimingInsights')
      .select('*')
      .order('analysis_date', { ascending: false });

    if (skill) {
      query = query.eq('skill_or_trend', skill);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      throw new Error(`Failed to fetch market timing insights: ${error.message}`);
    }

    return NextResponse.json({
      timing_insights: data || [],
      critical_timing: data?.filter(insight => insight.learning_window_urgency === 'critical') || [],
      last_analyzed: new Date().toISOString()
    });

  } catch (error) {
    throw error;
  }
}

// Helper function to get skill combination value
async function getSkillCombinationValue(skill?: string | null) {
  try {
    let query = engineerSupabase
      .from('SkillCombinationValue')
      .select('*')
      .order('market_premium_percentage', { ascending: false });

    if (skill) {
      query = query.contains('skill_combination', [skill]);
    }

    const { data, error } = await query.limit(20);

    if (error) {
      throw new Error(`Failed to fetch skill combination value: ${error.message}`);
    }

    return NextResponse.json({
      skill_combinations: data || [],
      high_value_combinations: data?.filter(combo => (combo.market_premium_percentage || 0) > 20) || [],
      last_analyzed: new Date().toISOString()
    });

  } catch (error) {
    throw error;
  }
}

// AI-powered market analysis generation
async function generateMarketAnalysis(skillName: string, location: string = 'Global') {
  try {
    const prompt = `
      As a senior market intelligence analyst, provide a comprehensive market analysis for "${skillName}" in the ${location} market.
      
      Analyze:
      1. Current demand score (0-100)
      2. Growth velocity (monthly percentage growth)
      3. Market saturation level (0-100)
      4. High-value skill combinations with ${skillName}
      5. Industry demand breakdown
      6. Geographic hotspots
      7. Career progression value (0-100)
      8. Automation risk (0-100)
      9. Learning ROI score (0-100)
      10. Market predictions for next 12-24 months
      
      Consider current tech trends, job market data, and industry reports.
      
      Return a JSON object with this structure:
      {
        "skill_name": "${skillName}",
        "category": "technology category",
        "demand_score": 85,
        "growth_velocity": 12.5,
        "market_saturation": 45.0,
        "skill_combinations": [["Python", "AI"], ["React", "TypeScript"]],
        "industry_demand": {
          "technology": 85,
          "finance": 65,
          "healthcare": 45
        },
        "geographic_hotspots": [
          {"location": "San Francisco", "demand_score": 95},
          {"location": "New York", "demand_score": 88}
        ],
        "career_progression_value": 90,
        "automation_risk": 15.0,
        "learning_roi_score": 88,
        "market_predictions": {
          "12_months": "continued high growth",
          "24_months": "market stabilization expected",
          "key_drivers": ["AI adoption", "digital transformation"]
        }
      }
    `;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 1500,
    });

    const analysis = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');

    // Save to database
    const { data: savedAnalysis, error } = await engineerSupabase
      .from('SkillMarketAnalytics')
      .upsert(analysis, {
        onConflict: 'skill_name'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving market analysis:', error);
    }

    return NextResponse.json({
      market_analysis: analysis,
      saved_to_db: !error,
      generated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating market analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate market analysis' },
      { status: 500 }
    );
  }
}

// Calculate career ROI for a specific skill
async function calculateSkillROI(
  engineerId: number, 
  skillName: string, 
  currentSalary: number | null = null, 
  location: string = 'Global'
) {
  try {
    // Get engineer's current salary if not provided
    if (!currentSalary) {
      // This would need to be implemented based on your salary data
      currentSalary = 75000; // Default assumption
    }

    // Get market data for the skill
    const { data: marketData } = await engineerSupabase
      .from('MarketJobData')
      .select('*')
      .eq('skill_name', skillName)
      .eq('location', location)
      .order('last_updated', { ascending: false })
      .limit(1);

    const projectedSalary = marketData?.[0]?.avg_salary_max || currentSalary + 25000;
    const salaryIncrease = projectedSalary - currentSalary;
    const roiPercentage = currentSalary > 0 ? (salaryIncrease / currentSalary) * 100 : 0;
    
    // Estimate learning costs (hours * opportunity cost)
    const learningHours = 200; // Default estimate
    const opportunityCost = 50; // Per hour
    const learningCost = learningHours * opportunityCost;
    
    const paybackPeriodMonths = salaryIncrease > 0 ? Math.ceil(learningCost / (salaryIncrease / 12)) : 12;

    const roiAnalysis: CareerROIAnalysis = {
      engineer_id: engineerId,
      skill_name: skillName,
      current_market_value: currentSalary,
      projected_market_value: projectedSalary,
      learning_investment_hours: learningHours,
      learning_cost_estimate: learningCost,
      time_to_proficiency_months: 6,
      roi_percentage: roiPercentage,
      payback_period_months: paybackPeriodMonths,
      risk_factors: ['market_volatility', 'technology_disruption'],
      market_confidence_score: 75,
      geographic_variance: { [location]: roiPercentage },
      career_advancement_potential: roiPercentage > 30 ? 'high' : roiPercentage > 15 ? 'medium' : 'low',
      recommendation_strength: roiPercentage > 50 ? 'high' : roiPercentage > 25 ? 'medium' : roiPercentage > 10 ? 'low' : 'avoid'
    };

    // Save to database
    const { data: savedROI, error } = await engineerSupabase
      .from('CareerROIAnalysis')
      .insert(roiAnalysis)
      .select()
      .single();

    if (error) {
      console.error('Error saving ROI analysis:', error);
    }

    return NextResponse.json({
      roi_analysis: roiAnalysis,
      saved_to_db: !error,
      calculated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error calculating skill ROI:', error);
    return NextResponse.json(
      { error: 'Failed to calculate skill ROI' },
      { status: 500 }
    );
  }
}

// Analyze skill combinations for market value
async function analyzeSkillCombinations(skills: string[]) {
  try {
    const prompt = `
      Analyze the market value of this skill combination: ${skills.join(', ')}
      
      Provide:
      1. Market premium percentage compared to individual skills
      2. Job availability score (0-100)
      3. Top companies demanding this combination
      4. Typical roles requiring these skills
      5. Experience levels where this combination is valuable
      6. Geographic demand hotspots
      7. Trend direction (rising/stable/declining)
      
      Return JSON with this structure:
      {
        "skill_combination": ${JSON.stringify(skills)},
        "market_premium_percentage": 35.5,
        "job_availability_score": 78,
        "companies_demanding": ["Google", "Microsoft", "Amazon"],
        "typical_roles": ["Full Stack Developer", "DevOps Engineer"],
        "experience_levels": ["mid", "senior"],
        "geographic_demand": {
          "San Francisco": 90,
          "New York": 85,
          "Austin": 75
        },
        "trend_direction": "rising"
      }
    `;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 800,
    });

    const analysis = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    
    // Generate combination hash for uniqueness
    const sortedSkills = [...skills].sort();
    const combinationHash = sortedSkills.join('|').toLowerCase();
    
    analysis.combination_hash = combinationHash;

    // Save to database
    const { data: savedCombination, error } = await engineerSupabase
      .from('SkillCombinationValue')
      .upsert(analysis, {
        onConflict: 'combination_hash'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving skill combination analysis:', error);
    }

    return NextResponse.json({
      combination_analysis: analysis,
      saved_to_db: !error,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing skill combinations:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skill combinations' },
      { status: 500 }
    );
  }
}

// Generate market timing insights
async function generateTimingInsights(skillOrTrend: string) {
  try {
    const prompt = `
      As a market timing expert, analyze the optimal learning timing for "${skillOrTrend}".
      
      Determine:
      1. Current market phase (emerging/growth/maturity/decline/disruption)
      2. Optimal entry timing (now/3_months/6_months/1_year/wait)
      3. Market saturation timeline
      4. Adoption curve position (0-100%)
      5. Competitive intensity (0-100)
      6. Learning window urgency (critical/high/medium/low)
      7. Market disruption risk (0-100%)
      8. Historical patterns
      9. Expert sentiment analysis
      10. Social signals and investment activity
      
      Return JSON:
      {
        "skill_or_trend": "${skillOrTrend}",
        "market_phase": "growth",
        "optimal_entry_timing": "now",
        "market_saturation_timeline": {
          "6_months": "early_majority",
          "12_months": "late_majority",
          "24_months": "laggards"
        },
        "adoption_curve_position": 35.0,
        "competitive_intensity": 65,
        "learning_window_urgency": "high",
        "market_disruption_risk": 25.0,
        "historical_patterns": ["similar to react in 2016", "follows typical js framework adoption"],
        "expert_sentiment": {
          "positive": 75,
          "neutral": 20,
          "negative": 5
        },
        "social_signals": {
          "github_stars": "increasing",
          "job_postings": "growing_rapidly",
          "search_volume": "trending_up"
        },
        "investment_activity": {
          "funding_rounds": 15,
          "total_investment": "500M",
          "major_backers": ["a16z", "sequoia"]
        }
      }
    `;

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 1200,
    });

    const insights = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');

    // Save to database
    const { data: savedInsights, error } = await engineerSupabase
      .from('MarketTimingInsights')
      .upsert(insights, {
        onConflict: 'skill_or_trend'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving timing insights:', error);
    }

    return NextResponse.json({
      timing_insights: insights,
      saved_to_db: !error,
      analyzed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating timing insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate timing insights' },
      { status: 500 }
    );
  }
}

// Update market data from external sources
async function updateMarketData(data: any) {
  try {
    // This would integrate with external APIs like LinkedIn, Indeed, Glassdoor
    // For now, we'll simulate with provided data
    
    const { data: savedData, error } = await engineerSupabase
      .from('MarketJobData')
      .upsert(data, {
        onConflict: 'skill_name,location,experience_level'
      })
      .select();

    if (error) {
      throw new Error(`Failed to update market data: ${error.message}`);
    }

    return NextResponse.json({
      updated_records: savedData?.length || 0,
      data: savedData,
      updated_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error updating market data:', error);
    return NextResponse.json(
      { error: 'Failed to update market data' },
      { status: 500 }
    );
  }
}

// Get comprehensive market intelligence dashboard for an engineer
async function getMarketIntelligenceDashboard(engineerId: number, location?: string | null) {
  try {
    // Get engineer's skills
    const { data: engineerSkills } = await engineerSupabase
      .from('ingenieur_competences')
      .select(`
        niveau,
        competences (
          nom_competence,
          categorie
        )
      `)
      .eq('ingenieur_id', engineerId);

    const skills = engineerSkills?.map(skill => 
      (skill.competences as any)?.nom_competence
    ).filter(Boolean) || [];

    // Get market analytics for engineer's skills
    const { data: skillAnalytics } = await engineerSupabase
      .from('SkillMarketAnalytics')
      .select('*')
      .in('skill_name', skills)
      .order('demand_score', { ascending: false });

    // Get ROI analyses
    const { data: roiAnalyses } = await engineerSupabase
      .from('CareerROIAnalysis')
      .select('*')
      .eq('engineer_id', engineerId)
      .order('roi_percentage', { ascending: false })
      .limit(10);

    // Get skill combinations the engineer can form
    const { data: skillCombinations } = await engineerSupabase
      .from('SkillCombinationValue')
      .select('*')
      .order('market_premium_percentage', { ascending: false })
      .limit(20);

    // Filter combinations where engineer has at least 2 skills
    const relevantCombinations = skillCombinations?.filter(combo => {
      const comboSkills = combo.skill_combination as string[];
      const matchCount = comboSkills.filter(skill => skills.includes(skill)).length;
      return matchCount >= 2;
    }) || [];

    // Get timing insights for trending skills
    const { data: timingInsights } = await engineerSupabase
      .from('MarketTimingInsights')
      .select('*')
      .in('learning_window_urgency', ['critical', 'high'])
      .order('analysis_date', { ascending: false })
      .limit(10);

    // Get geographic data for specified location
    const { data: geographicData } = location ? await engineerSupabase
      .from('GeographicMarketData')
      .select('*')
      .eq('location', location)
      .single() : null;

    const dashboard = {
      engineer_id: engineerId,
      engineer_skills: skills,
      skill_market_analytics: skillAnalytics || [],
      roi_opportunities: roiAnalyses || [],
      skill_combinations: relevantCombinations,
      timing_insights: timingInsights || [],
      geographic_insights: geographicData,
      recommendations: {
        high_roi_skills: roiAnalyses?.filter(roi => roi.roi_percentage > 50).slice(0, 5) || [],
        urgent_learning: timingInsights?.filter(insight => insight.learning_window_urgency === 'critical') || [],
        valuable_combinations: relevantCombinations.slice(0, 3)
      },
      market_summary: {
        total_skills_analyzed: skillAnalytics?.length || 0,
        average_demand_score: skillAnalytics?.length ? 
          skillAnalytics.reduce((sum, skill) => sum + skill.demand_score, 0) / skillAnalytics.length : 0,
        best_roi_opportunity: roiAnalyses?.[0]?.roi_percentage || 0,
        critical_timing_count: timingInsights?.filter(insight => insight.learning_window_urgency === 'critical').length || 0
      },
      last_updated: new Date().toISOString()
    };

    return NextResponse.json(dashboard);

  } catch (error) {
    console.error('Error generating market intelligence dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to generate market intelligence dashboard' },
      { status: 500 }
    );
  }
} 