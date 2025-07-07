import { NextRequest, NextResponse } from 'next/server';
import { engineerSupabase, engineerSupabaseAdmin, testConnection } from '@/lib/supabase-engineer';
import { 
  EngineerTrendFocus, 
  EngineerTrendRecommendation, 
  TrendFocusRequest,
  TrendRecommendationRequest 
} from '@/lib/types/engineer-ranking';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Fallback sample trends if the main API is unavailable
// Helper function to determine professional field from skills and profile
function determineProfessionalField(skills: string[], engineerData: any): string {
  const skillsLower = skills.map(s => s.toLowerCase());
  
  // Define skill-to-industry mappings
  const industryPatterns = {
    'fintech': ['finance', 'banking', 'payment', 'trading', 'fintech', 'blockchain', 'cryptocurrency'],
    'healthcare': ['healthcare', 'medical', 'health', 'clinical', 'patient', 'hospital', 'pharma'],
    'ecommerce': ['ecommerce', 'retail', 'marketplace', 'shopping', 'inventory', 'commerce'],
    'gaming': ['game', 'gaming', 'unity', 'unreal', 'graphics', '3d', 'animation'],
    'enterprise': ['enterprise', 'erp', 'crm', 'business', 'corporate', 'sap', 'oracle'],
    'data_science': ['data', 'analytics', 'machine learning', 'ai', 'ml', 'statistics', 'bigdata'],
    'cybersecurity': ['security', 'cybersecurity', 'encryption', 'penetration', 'vulnerability'],
    'devops': ['devops', 'infrastructure', 'deployment', 'docker', 'kubernetes', 'aws', 'cloud'],
    'frontend': ['frontend', 'ui', 'ux', 'react', 'vue', 'angular', 'css', 'html'],
    'backend': ['backend', 'api', 'server', 'database', 'microservices', 'node', 'python'],
    'mobile': ['mobile', 'ios', 'android', 'react native', 'flutter', 'swift', 'kotlin'],
    'blockchain': ['blockchain', 'crypto', 'web3', 'smart contracts', 'defi', 'nft']
  };
  
  // Score each industry based on skill matches
  const industryScores: { [key: string]: number } = {};
  
  for (const [industry, patterns] of Object.entries(industryPatterns)) {
    industryScores[industry] = 0;
    
    for (const pattern of patterns) {
      for (const skill of skillsLower) {
        if (skill.includes(pattern) || pattern.includes(skill)) {
          industryScores[industry] += 1;
        }
      }
    }
  }
  
  // Find the industry with the highest score
  const topIndustry = Object.entries(industryScores)
    .filter(([_, score]) => score > 0)
    .sort(([_, a], [__, b]) => b - a)[0];
  
  return topIndustry ? topIndustry[0] : 'technology';
}

// Helper function to map professional field to relevant trend categories
function getRelevantTrendCategories(professionalField: string): string[] {
  const categoryMappings: { [key: string]: string[] } = {
    'fintech': ['backend', 'security', 'blockchain', 'cloud', 'data'],
    'healthcare': ['data', 'ai/ml', 'security', 'cloud', 'backend'],
    'ecommerce': ['frontend', 'backend', 'mobile', 'cloud', 'data'],
    'gaming': ['frontend', 'mobile', 'ai/ml', 'cloud', 'emerging'],
    'enterprise': ['backend', 'cloud', 'security', 'data', 'devops'],
    'data_science': ['ai/ml', 'data', 'cloud', 'backend'],
    'cybersecurity': ['security', 'cloud', 'backend', 'devops'],
    'devops': ['devops', 'cloud', 'backend', 'security'],
    'frontend': ['frontend', 'mobile', 'emerging'],
    'backend': ['backend', 'cloud', 'data', 'devops'],
    'mobile': ['mobile', 'frontend', 'cloud'],
    'blockchain': ['web3', 'security', 'backend'],
    'technology': ['frontend', 'backend', 'ai/ml', 'devops', 'mobile', 'cloud'] // Default
  };
  
  return categoryMappings[professionalField] || categoryMappings['technology'];
}

function getSampleTrends() {
  return [
    {
      id: "react-server-components",
      name: "React Server Components",
      category: "frontend",
      skills: ["React", "Next.js", "Server-Side Rendering"],
      marketDemand: { jobOpenings: 12000, salaryRange: "$105,000 - $160,000" },
      timeToLearn: "2-3 months"
    },
    {
      id: "ai-agents",
      name: "AI Agents & Autonomous Systems", 
      category: "ai/ml",
      skills: ["Python", "LangChain", "OpenAI API", "Vector Databases"],
      marketDemand: { jobOpenings: 15000, salaryRange: "$120,000 - $200,000" },
      timeToLearn: "3-6 months"
    },
    {
      id: "kubernetes",
      name: "Kubernetes & Container Orchestration",
      category: "devops", 
      skills: ["Kubernetes", "Docker", "DevOps", "Cloud Platforms"],
      marketDemand: { jobOpenings: 18000, salaryRange: "$110,000 - $180,000" },
      timeToLearn: "3-5 months"
    },
    {
      id: "typescript",
      name: "TypeScript & Advanced JavaScript",
      category: "frontend",
      skills: ["TypeScript", "JavaScript", "React", "Node.js"],
      marketDemand: { jobOpenings: 25000, salaryRange: "$90,000 - $150,000" },
      timeToLearn: "2-4 months"
    },
    {
      id: "cloud-native",
      name: "Cloud-Native Development",
      category: "cloud",
      skills: ["AWS", "Azure", "GCP", "Microservices", "Serverless"],
      marketDemand: { jobOpenings: 20000, salaryRange: "$115,000 - $190,000" },
      timeToLearn: "4-6 months"
    }
  ];
}

// GET - Fetch engineer's trend dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const engineerId = searchParams.get('engineer_id');

    if (!engineerId) {
      return NextResponse.json(
        { error: 'Engineer ID is required' },
        { status: 400 }
      );
    }

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    // Fetch engineer info
    const { data: engineerData, error: engineerError } = await engineerSupabase
      .from('ingenieurs')
      .select('*')
      .eq('ingenieur_id', engineerId)
      .single();

    if (engineerError || !engineerData) {
      return NextResponse.json(
        { error: 'Engineer not found' },
        { status: 404 }
      );
    }

    // Fetch engineer's skills
    const { data: skillsData } = await engineerSupabase
      .from('ingenieur_competences')
      .select(`
        niveau,
        competences (
          nom_competence,
          categorie
        )
      `)
      .eq('ingenieur_id', engineerId);

    const currentSkills = skillsData?.map(skill => 
      (skill.competences as any)?.nom_competence
    ).filter(Boolean) || [];

    // Fetch active trend focuses
    const { data: trendFocuses } = await engineerSupabase
      .from('EngineerTrendFocus')
      .select('*')
      .eq('engineer_id', engineerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Fetch recommendations
    const { data: recommendations } = await engineerSupabase
      .from('EngineerTrendRecommendations')
      .select('*')
      .eq('engineer_id', engineerId)
      .eq('is_dismissed', false)
      .order('relevance_score', { ascending: false })
      .limit(10);

    // Fetch recent learning activities
    const { data: activities } = await engineerSupabase
      .from('EngineerLearningActivities')
      .select('*')
      .eq('engineer_id', engineerId)
      .order('activity_date', { ascending: false })
      .limit(10);

    // Fetch learning goals
    const { data: goals } = await engineerSupabase
      .from('EngineerTrendGoals')
      .select('*')
      .eq('engineer_id', engineerId)
      .in('status', ['active', 'in_progress'])
      .order('priority', { ascending: true });

    // Determine professional field/industry from skills and experience
    const professionalField = determineProfessionalField(currentSkills, engineerData);

    const dashboard = {
      engineer_id: parseInt(engineerId),
      engineer_info: {
        name: `${engineerData.prenom} ${engineerData.nom}`.trim(),
        email: engineerData.email,
        current_skills: currentSkills,
        professional_field: professionalField,
        experience_level: 'mid' // Could be determined from assessment data
      },
      active_trends: trendFocuses || [],
      recommendations: recommendations || [],
      recent_activities: activities || [],
      learning_goals: goals || [],
      progress_summary: {
        total_active_trends: trendFocuses?.length || 0,
        completed_trends: 0, // Could fetch from database
        total_learning_hours: activities?.reduce((sum, activity) => 
          sum + (activity.time_spent_hours || 0), 0) || 0,
        skills_gained_this_month: 0, // Could calculate from recent activities
        next_milestones: [] // Could fetch from goals
      },
      skill_development_chart: [] // Could generate from trend progress
    };

    return NextResponse.json(dashboard);

  } catch (error) {
    console.error('Error fetching engineer trends dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch engineer trends dashboard' },
      { status: 500 }
    );
  }
}

// POST - Add new trend focus or generate recommendations
export async function POST(request: NextRequest) {
  try {
    const { action, ...requestData } = await request.json();

    const connectionOk = await testConnection();
    if (!connectionOk) {
      return NextResponse.json(
        { error: 'Engineer database not available' },
        { status: 503 }
      );
    }

    switch (action) {
      case 'add_trend_focus':
        return await addTrendFocus(requestData as TrendFocusRequest);
      
      case 'generate_recommendations':
        return await generateTrendRecommendations(requestData as TrendRecommendationRequest);
      
      case 'dismiss_recommendation':
        return await dismissRecommendation(requestData.recommendation_id);
      
      case 'cleanup_duplicates':
        return await cleanupDuplicateFocuses(requestData.engineer_id);
      
      case 'get_learning_resources':
        return await generateLearningResources(requestData);
      
      case 'update_progress':
        return await updateTrendProgress(requestData);
      
      case 'create_sample_activities':
        return await createSampleActivities(requestData.engineer_id);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in engineer trends POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Helper function to add trend focus
async function addTrendFocus(request: TrendFocusRequest) {
  try {
    // Check if engineer already has this trend in focus
    const { data: existingFocus } = await engineerSupabase
      .from('EngineerTrendFocus')
      .select('id, status')
      .eq('engineer_id', request.engineer_id)
      .eq('trend_id', request.trend_id)
      .eq('status', 'active')
      .single();

    if (existingFocus) {
      return NextResponse.json({
        error: 'This trend is already in your active focus list',
        trend_focus: existingFocus
      }, { status: 409 }); // 409 Conflict
    }

    const trendFocusData = {
      engineer_id: request.engineer_id,
      trend_id: request.trend_id,
      trend_name: request.trend_name,
      focus_reason: request.focus_reason,
      priority_level: request.priority_level,
      target_completion_date: request.target_completion_date,
      status: 'active' as const
    };

    const { data: trendFocus, error } = await engineerSupabaseAdmin
      .from('EngineerTrendFocus')
      .insert(trendFocusData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add trend focus: ${error.message}`);
    }

    // If learning goals are specified, create progress tracking
    if (request.learning_goals && request.learning_goals.length > 0) {
      const progressEntries = request.learning_goals.map(goal => ({
        engineer_trend_focus_id: trendFocus.id,
        skill_name: goal.skill_name,
        current_level: goal.current_level,
        target_level: goal.target_level,
        learning_resources_completed: [],
        time_invested_hours: 0
      }));

      await engineerSupabaseAdmin
        .from('EngineerTrendProgress')
        .insert(progressEntries);
    }

    return NextResponse.json({
      success: true,
      trend_focus: trendFocus,
      message: `Successfully added focus on ${request.trend_name}`
    });

  } catch (error) {
    console.error('Error adding trend focus:', error);
    throw error;
  }
}

// Helper function to generate AI-powered trend recommendations
async function generateTrendRecommendations(request: TrendRecommendationRequest) {
  try {
    // Fetch engineer's current skills if not provided
    let currentSkills = request.current_skills || [];
    
    if (currentSkills.length === 0) {
      const { data: skillsData } = await engineerSupabase
        .from('ingenieur_competences')
        .select(`
          competences (
            nom_competence
          )
        `)
        .eq('ingenieur_id', request.engineer_id);

      currentSkills = skillsData?.map(skill => 
        (skill.competences as any)?.nom_competence
      ).filter(Boolean) || [];
    }

    // Determine engineer's professional field
    const { data: engineerInfo } = await engineerSupabase
      .from('ingenieurs')
      .select('*')
      .eq('ingenieur_id', request.engineer_id)
      .single();

    const professionalField = determineProfessionalField(currentSkills, engineerInfo || {});
    const relevantCategories = getRelevantTrendCategories(professionalField);
    
    console.log(`🎯 Engineer professional field: ${professionalField}`);
    console.log(`📊 Relevant trend categories: ${relevantCategories.join(', ')}`);

    // Get personalized trends from IT trends API based on professional field
    console.log('Fetching personalized trends for recommendations...');
    let availableTrends = [];
    
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      
      // Use the personalized trends endpoint with user skills and industry
      const trendsUrl = new URL(`${baseUrl}/api/it-trends`);
      trendsUrl.searchParams.set('personalize', 'true');
      trendsUrl.searchParams.set('skills', currentSkills.join(','));
      trendsUrl.searchParams.set('industry', professionalField);
      
      const trendsResponse = await fetch(trendsUrl.toString(), {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!trendsResponse.ok) {
        console.error('Failed to fetch personalized trends:', trendsResponse.status, trendsResponse.statusText);
        console.log('Using fallback trends due to API error');
        availableTrends = getSampleTrends();
      } else {
        const contentType = trendsResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const trendsData = await trendsResponse.json();
          availableTrends = trendsData.trends || [];
          
          // Filter trends by relevant categories for the professional field
          availableTrends = availableTrends.filter((trend: any) => 
            relevantCategories.includes(trend.category)
          );
          
          console.log(`✅ Found ${availableTrends.length} field-relevant trends (filtered from ${trendsData.trends?.length || 0} total)`);
        } else {
          console.warn('IT trends API returned non-JSON response, using fallback');
          availableTrends = getSampleTrends();
        }
      }
    } catch (error) {
      console.error('Error fetching personalized trends:', error);
      console.log('Using fallback trends due to fetch error');
      // Fallback to sample trends
      availableTrends = getSampleTrends();
    }
    
    // Ensure we have trends to work with
    if (availableTrends.length === 0) {
      console.log('No field-relevant trends available, using sample trends');
      availableTrends = getSampleTrends();
    }

    // Generate AI recommendations
    const aiPrompt = `
You are an expert career advisor specializing in technology trends and skill development.

ENGINEER PROFILE:
- Current Skills: ${currentSkills.join(', ')}
- Professional Field: ${professionalField}
- Relevant Tech Categories: ${relevantCategories.join(', ')}
- Career Goals: ${request.career_goals?.join(', ') || 'Not specified'}
- Industry Preference: ${request.industry_preference || professionalField}
- Experience Level: ${request.experience_level || 'Mid-level'}
- Available Learning Time: ${request.time_availability || 5} hours per week
- Include Emerging Trends: ${request.include_emerging_trends ? 'Yes' : 'No'}

AVAILABLE TRENDS TO EVALUATE:
${availableTrends.map((trend: any) => `
- ${trend.name} (${trend.category})
  Skills: ${trend.skills.join(', ')}
  Market Demand: ${trend.marketDemand.jobOpenings} jobs, ${trend.marketDemand.salaryRange}
  Time to Learn: ${trend.timeToLearn}
`).join('\n')}

Please analyze and recommend the TOP 5 most relevant trends for this engineer, considering:
1. PROFESSIONAL FIELD RELEVANCE: How well the trend applies to ${professionalField} industry
2. Skill alignment and natural progression paths from current skills
3. Market demand and career impact within ${professionalField} sector
4. Learning time vs available time (prioritize ${request.time_availability || 5} hours/week)
5. Career goals alignment and growth opportunities in ${professionalField}

IMPORTANT: Focus heavily on trends that are specifically valuable in the ${professionalField} industry. 
Avoid recommending trends that are not applicable to their professional domain.

For each recommendation, provide:
- Relevance score (0-100)
- Recommendation reason (2-3 sentences)
- Market alignment score (0-100)
- Skill gap analysis
- Estimated learning time
- Career impact score (0-100)

Return as JSON array of recommendations.
`;

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: aiPrompt,
      temperature: 0.7,
    });

    // Parse AI response and save recommendations
    let recommendations: any[] = [];
    try {
      // Try to parse the AI response as JSON
      const parsed = JSON.parse(text);
      recommendations = Array.isArray(parsed) ? parsed : [parsed];
      console.log(`AI generated ${recommendations.length} recommendations`);
    } catch (parseError) {
      console.warn('Failed to parse AI recommendations, using intelligent fallback');
      console.log('AI response was:', text.substring(0, 200) + '...');
      
      // Intelligent fallback: match trends to user skills
      recommendations = availableTrends.slice(0, 5).map((trend: any, index: number) => {
        const skillOverlap = trend.skills.filter((skill: string) => 
          currentSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
        
        const relevanceScore = Math.max(50, 90 - index * 8 + skillOverlap.length * 5);
        
        return {
          trend_id: trend.id,
          trend_name: trend.name,
          relevance_score: relevanceScore,
          recommendation_reason: skillOverlap.length > 0 
            ? `This trend builds on your existing skills: ${skillOverlap.join(', ')}. Strong market demand with ${trend.marketDemand?.jobOpenings || 'many'} job openings.`
            : `This emerging trend has strong market demand and complements your technical background. Learning this could open new career opportunities.`,
          market_alignment_score: Math.min(90, 60 + index * 5 + skillOverlap.length * 10),
          skill_gap_analysis: {
            missing_skills: trend.skills.filter((skill: string) => !currentSkills.includes(skill)),
            weak_skills: [],
            related_skills: skillOverlap,
            skill_overlap_percentage: Math.round((skillOverlap.length / trend.skills.length) * 100)
          },
          estimated_learning_time: trend.timeToLearn || `${2 + index}−${4 + index} months`,
          career_impact_score: Math.max(70, 85 - index * 5)
        };
      });
      
      console.log(`Generated ${recommendations.length} fallback recommendations`);
    }
    
    // Ensure we have valid recommendations
    if (!recommendations || recommendations.length === 0) {
      console.log('No recommendations generated, creating default ones');
      recommendations = getSampleTrends().slice(0, 3).map((trend, index) => ({
        trend_id: trend.id,
        trend_name: trend.name,
        relevance_score: 75 - index * 5,
        recommendation_reason: `Popular trend in ${trend.category} with strong market demand.`,
        market_alignment_score: 70,
        skill_gap_analysis: {
          missing_skills: trend.skills,
          weak_skills: [],
          related_skills: [],
          skill_overlap_percentage: 0
        },
        estimated_learning_time: trend.timeToLearn,
        career_impact_score: 75
      }));
    }

    // Save recommendations to database
    console.log(`Saving ${recommendations.length} recommendations to database...`);
    
    // First, delete any existing recommendations for this engineer
    const { error: deleteError } = await engineerSupabaseAdmin
      .from('EngineerTrendRecommendations')
      .delete()
      .eq('engineer_id', request.engineer_id);

    if (deleteError) {
      console.warn('Error deleting existing recommendations:', deleteError.message);
    }

    // Then insert new recommendations
    const recommendationEntries = recommendations.map(rec => ({
      engineer_id: request.engineer_id,
      trend_id: rec.trend_id,
      trend_name: rec.trend_name,
      relevance_score: rec.relevance_score,
      recommendation_reason: rec.recommendation_reason,
      market_alignment_score: rec.market_alignment_score,
      skill_gap_analysis: rec.skill_gap_analysis,
      estimated_learning_time: rec.estimated_learning_time,
      career_impact_score: rec.career_impact_score,
      is_dismissed: false
    }));

    const { data: savedRecommendations, error } = await engineerSupabaseAdmin
      .from('EngineerTrendRecommendations')
      .insert(recommendationEntries)
      .select();

    if (error) {
      console.error('Database insert error:', error);
      throw new Error(`Failed to save recommendations: ${error.message}`);
    }
    
    console.log(`Successfully saved ${savedRecommendations.length} recommendations`);

    return NextResponse.json({
      success: true,
      recommendations: savedRecommendations,
      message: `Generated ${savedRecommendations.length} personalized trend recommendations`
    });

  } catch (error) {
    console.error('Error generating trend recommendations:', error);
    throw error;
  }
}

// Helper function to dismiss a recommendation
async function dismissRecommendation(recommendationId: string) {
  try {
    const { data, error } = await engineerSupabaseAdmin
      .from('EngineerTrendRecommendations')
      .update({ is_dismissed: true })
      .eq('id', recommendationId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to dismiss recommendation: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Recommendation dismissed successfully'
    });

  } catch (error) {
    console.error('Error dismissing recommendation:', error);
    throw error;
  }
}

// Helper function to cleanup duplicate trend focuses
async function cleanupDuplicateFocuses(engineerId: number) {
  try {
    console.log(`🧹 Cleaning up duplicate focuses for engineer ${engineerId}`);
    
    // Get all trend focuses for this engineer
    const { data: allFocuses, error: fetchError } = await engineerSupabase
      .from('EngineerTrendFocus')
      .select('*')
      .eq('engineer_id', engineerId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw new Error(`Failed to fetch focuses: ${fetchError.message}`);
    }

    if (!allFocuses || allFocuses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No focuses found to cleanup',
        duplicates_removed: 0
      });
    }

    // Group by trend_id to find duplicates
    const focusGroups = allFocuses.reduce((groups, focus) => {
      const trendId = focus.trend_id;
      if (!groups[trendId]) groups[trendId] = [];
      groups[trendId].push(focus);
      return groups;
    }, {} as Record<string, any[]>);

    // Find duplicates (groups with more than 1 focus)
    const duplicateGroups = Object.entries(focusGroups).filter(([_, focuses]) => (focuses as any[]).length > 1);
    
    if (duplicateGroups.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duplicate focuses found',
        duplicates_removed: 0
      });
    }

    let totalRemoved = 0;

    // For each duplicate group, keep the oldest (first created) and remove the rest
    for (const [trendId, focuses] of duplicateGroups) {
      const focusArray = focuses as any[]; // Type assertion for the array
      const [keepFocus, ...removeFocuses] = focusArray; // Keep first (oldest), remove rest
      
      console.log(`Removing ${removeFocuses.length} duplicate focuses for trend ${trendId}`);
      
      // Delete the duplicate focuses
      const idsToRemove = removeFocuses.map(f => f.id);
      const { error: deleteError } = await engineerSupabaseAdmin
        .from('EngineerTrendFocus')
        .delete()
        .in('id', idsToRemove);

      if (deleteError) {
        console.error(`Error removing duplicates for trend ${trendId}:`, deleteError);
      } else {
        totalRemoved += removeFocuses.length;
      }
    }

    console.log(`✅ Cleanup complete: removed ${totalRemoved} duplicate focuses`);

    return NextResponse.json({
      success: true,
      message: `Cleanup completed: removed ${totalRemoved} duplicate focuses`,
      duplicates_removed: totalRemoved
    });

  } catch (error) {
    console.error('Error cleaning up duplicate focuses:', error);
    throw error;
  }
}

// Helper function to generate learning resources for a trend
async function generateLearningResources(request: any) {
  try {
    console.log(`📚 Generating learning resources for trend: ${request.trend_name}`);

    // Generate AI-powered learning resources
    const resourcePrompt = `
      Generate 3-5 high-quality learning resources for the technology trend: "${request.trend_name}".
      
      For each resource, provide:
      1. Title
      2. Description (2-3 sentences)
      3. Resource type (course, tutorial, documentation, video, book, etc.)
      4. Difficulty level (beginner, intermediate, advanced)
      5. Estimated time to complete
      6. Provider (if known, otherwise "Community" or "Official")
      7. URL (use realistic placeholder URLs if exact ones unknown)
      
      Focus on practical, hands-on resources that help build real skills.
      Include a mix of free and premium resources.
      Prioritize official documentation and well-known educational platforms.
      
      Return only a JSON array of resources.
    `;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning resource curator for software engineers. Return only valid JSON.'
          },
          {
            role: 'user',
            content: resourcePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    let resources;
    
    try {
      resources = JSON.parse(data.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', data.choices[0].message.content);
      // Fallback resources
      resources = [
        {
          title: `${request.trend_name} Official Documentation`,
          description: `Official documentation and getting started guide for ${request.trend_name}.`,
          resource_type: 'documentation',
          difficulty_level: 'beginner',
          estimated_time: '2-4 hours',
          provider: 'Official',
          url: `https://docs.${request.trend_name.toLowerCase().replace(/\s+/g, '')}.com`
        },
        {
          title: `Learn ${request.trend_name} - Interactive Tutorial`,
          description: `Hands-on tutorial to build real projects with ${request.trend_name}.`,
          resource_type: 'tutorial',
          difficulty_level: 'intermediate',
          estimated_time: '6-8 hours',
          provider: 'Community',
          url: `https://learn-${request.trend_name.toLowerCase().replace(/\s+/g, '-')}.dev`
        }
      ];
    }

    // Save resources as activities in the database
    const savedResources = [];
    for (let i = 0; i < resources.length; i++) {
      const resource = resources[i];
      
      const { data: activity, error } = await engineerSupabaseAdmin
        .from('EngineerLearningActivities')
        .insert({
          engineer_id: request.engineer_id,
          trend_id: request.trend_id,
          activity_title: resource.title,
          activity_description: resource.description,
          activity_type: 'resource_read',
          activity_url: resource.url,
          provider: resource.provider,
          time_spent_hours: parseFloat(resource.estimated_time.match(/\d+/)?.[0] || '2'),
          completion_percentage: 0,
          skills_gained: [request.trend_name],
          activity_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving resource activity:', error);
      } else {
        savedResources.push(activity);
      }
    }

    console.log(`✅ Generated and saved ${savedResources.length} learning resources`);

    return NextResponse.json({
      success: true,
      message: `Generated ${savedResources.length} learning resources for ${request.trend_name}`,
      resources: savedResources
    });

  } catch (error) {
    console.error('Error generating learning resources:', error);
    return NextResponse.json(
      { error: 'Failed to generate learning resources', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to update trend progress
async function updateTrendProgress(request: any) {
  try {
    console.log(`📈 Updating progress for trend focus ${request.trend_focus_id} to ${request.new_progress}%`);

    // Update the trend focus progress
    const { data: updatedFocus, error: updateError } = await engineerSupabaseAdmin
      .from('EngineerTrendFocus')
      .update({
        current_progress: request.new_progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', request.trend_focus_id)
      .eq('engineer_id', request.engineer_id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update progress: ${updateError.message}`);
    }

    // Log this as an activity
    const { data: activity, error: activityError } = await engineerSupabaseAdmin
      .from('EngineerLearningActivities')
      .insert({
        engineer_id: request.engineer_id,
        trend_id: updatedFocus.trend_id,
        activity_title: `Progress Update: ${updatedFocus.trend_name}`,
        activity_description: request.activity_description || `Updated progress to ${request.new_progress}%`,
        activity_type: 'skill_practiced',
        completion_percentage: 100,
        skills_gained: [],
        activity_date: new Date().toISOString()
      })
      .select()
      .single();

    if (activityError) {
      console.error('Error logging progress activity:', activityError);
    }

    console.log(`✅ Successfully updated progress to ${request.new_progress}%`);

    return NextResponse.json({
      success: true,
      message: `Progress updated to ${request.new_progress}%`,
      updated_focus: updatedFocus,
      activity: activity
    });

  } catch (error) {
    console.error('Error updating progress:', error);
    return NextResponse.json(
      { error: 'Failed to update progress', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Helper function to create sample activities for testing purposes
async function createSampleActivities(engineerId: number) {
  try {
    console.log(`📚 Creating sample activities for engineer ${engineerId}`);

    // Generate sample activities
    const sampleActivities = [
      {
        activity_title: 'React Server Components Tutorial',
        activity_description: 'Completed an interactive tutorial on React Server Components fundamentals and best practices.',
        activity_type: 'course_completed',
        activity_url: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
        provider: 'Next.js',
        time_spent_hours: 3,
        completion_percentage: 100,
        skills_gained: ['React', 'Server Components', 'Next.js'],
        activity_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        activity_title: 'JavaScript Performance Optimization Course',
        activity_description: 'Studied advanced JavaScript performance optimization techniques including lazy loading and code splitting.',
        activity_type: 'course_completed',
        activity_url: 'https://web.dev/performance/',
        provider: 'Google Web.dev',
        time_spent_hours: 4,
        completion_percentage: 75,
        skills_gained: ['JavaScript', 'Performance', 'Web Optimization'],
        activity_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        activity_title: 'TypeScript Advanced Types Documentation',
        activity_description: 'Read through TypeScript documentation on advanced types, generics, and utility types.',
        activity_type: 'resource_read',
        activity_url: 'https://www.typescriptlang.org/docs/',
        provider: 'TypeScript',
        time_spent_hours: 2,
        completion_percentage: 90,
        skills_gained: ['TypeScript', 'Advanced Types', 'Generics'],
        activity_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
      },
      {
        activity_title: 'Building REST APIs with Node.js',
        activity_description: 'Hands-on project building a RESTful API with Node.js, Express, and JWT authentication.',
        activity_type: 'project_built',
        activity_url: 'https://nodejs.org/en/docs/',
        provider: 'Self-directed',
        time_spent_hours: 8,
        completion_percentage: 60,
        skills_gained: ['Node.js', 'REST API', 'JWT', 'Express'],
        activity_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      },
      {
        activity_title: 'Docker Containerization Workshop',
        activity_description: 'Attended a workshop on containerizing applications with Docker and Docker Compose.',
        activity_type: 'skill_practiced',
        activity_url: 'https://docs.docker.com/',
        provider: 'Docker',
        time_spent_hours: 5,
        completion_percentage: 100,
        skills_gained: ['Docker', 'Containerization', 'DevOps'],
        activity_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks ago
      }
    ];

    // Save activities to the database
    const savedActivities = [];
    for (let i = 0; i < sampleActivities.length; i++) {
      const activity = sampleActivities[i];
      
      const { data: savedActivity, error } = await engineerSupabaseAdmin
        .from('EngineerLearningActivities')
        .insert({
          engineer_id: engineerId,
          trend_id: null,
          ...activity
        })
        .select()
        .single();

      if (error) {
        console.error(`Error saving sample activity ${i + 1}:`, error);
      } else {
        savedActivities.push(savedActivity);
      }
    }

    console.log(`✅ Created and saved ${savedActivities.length} sample activities`);

    return NextResponse.json({
      success: true,
      message: `Created ${savedActivities.length} sample activities for engineer ${engineerId}`,
      activities: savedActivities
    });

  } catch (error) {
    console.error('Error creating sample activities:', error);
    return NextResponse.json(
      { error: 'Failed to create sample activities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}