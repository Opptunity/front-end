import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ITTrend } from "@/app/api/it-trends/route"

export interface TrendQuery {
  type: 'recommendation' | 'learning-path' | 'market-analysis' | 'comparison' | 'general'
  userSkills?: string[]
  userIndustry?: string
  experienceLevel?: string
  specificTechnology?: string
  careerGoals?: string
  timeframe?: string
}

export interface TrendRecommendation {
  trend: ITTrend
  relevanceScore: number
  reasoning: string
  learningPriority: 'high' | 'medium' | 'low'
  careerImpact: string
  timeToMaster: string
  prerequisites: string[]
  nextSteps: string[]
}

export interface LearningPath {
  title: string
  description: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  steps: Array<{
    phase: string
    duration: string
    skills: string[]
    resources: Array<{
      type: string
      title: string
      url?: string
      estimated_time: string
    }>
    milestones: string[]
  }>
  prerequisites: string[]
  careerOutcomes: string[]
}

export interface MarketAnalysis {
  trend: string
  marketSize: string
  growthProjection: string
  demandLevel: 'very-high' | 'high' | 'medium' | 'low'
  averageSalary: string
  jobAvailability: string
  skillRequirements: string[]
  industryAdoption: Array<{
    industry: string
    adoptionLevel: string
    timeline: string
  }>
  competitiveAdvantage: string
  futureOutlook: string
}

/**
 * Generate personalized trend recommendations based on user profile
 */
export async function generateTrendRecommendations(
  trends: ITTrend[],
  userProfile: {
    skills: string[]
    industry: string
    experienceLevel: string
    careerGoals?: string
  }
): Promise<TrendRecommendation[]> {
  const prompt = `
    As an expert IT career advisor and technology analyst, analyze these trending technologies and provide personalized recommendations for a professional with the following profile:
    
    User Profile:
    - Current Skills: ${userProfile.skills.join(', ')}
    - Industry: ${userProfile.industry}
    - Experience Level: ${userProfile.experienceLevel}
    - Career Goals: ${userProfile.careerGoals || 'Advance in current field'}
    
    Available Trends: ${trends.map(t => `${t.name}: ${t.description} (Category: ${t.category}, Popularity: ${t.popularity})`).join('\n')}
    
    For each relevant trend, provide:
    1. Relevance score (0-100) based on user's current skills and career trajectory
    2. Detailed reasoning for the recommendation
    3. Learning priority (high/medium/low)
    4. Career impact explanation
    5. Realistic time to master
    6. Specific prerequisites needed
    7. Concrete next steps
    
    Focus on trends that:
    - Build upon existing skills
    - Align with career goals
    - Have strong market demand
    - Offer clear advancement opportunities
    
    Return a JSON array with the top 5 most relevant trends in this format:
    [
      {
        "trendId": "trend-id",
        "relevanceScore": 85,
        "reasoning": "detailed explanation",
        "learningPriority": "high",
        "careerImpact": "impact description",
        "timeToMaster": "3-6 months",
        "prerequisites": ["prerequisite1", "prerequisite2"],
        "nextSteps": ["step1", "step2", "step3"]
      }
    ]
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 2000,
    })

    const recommendations = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || '[]')
    
    return recommendations.map((rec: any) => ({
      trend: trends.find(t => t.id === rec.trendId)!,
      relevanceScore: rec.relevanceScore,
      reasoning: rec.reasoning,
      learningPriority: rec.learningPriority,
      careerImpact: rec.careerImpact,
      timeToMaster: rec.timeToMaster,
      prerequisites: rec.prerequisites,
      nextSteps: rec.nextSteps
    })).filter(rec => rec.trend) // Filter out any recommendations without valid trends
  } catch (error) {
    console.error('Error generating trend recommendations:', error)
    return []
  }
}

/**
 * Generate a comprehensive learning path for a specific technology
 */
export async function generateLearningPath(
  technology: string,
  userProfile: {
    skills: string[]
    experienceLevel: string
    timeCommitment?: string
    learningStyle?: string
  }
): Promise<LearningPath | null> {
  const prompt = `
    Create a comprehensive, personalized learning path for mastering "${technology}" for a professional with:
    
    Profile:
    - Current Skills: ${userProfile.skills.join(', ')}
    - Experience Level: ${userProfile.experienceLevel}
    - Time Commitment: ${userProfile.timeCommitment || '10-15 hours per week'}
    - Learning Style: ${userProfile.learningStyle || 'Mixed (theory + practical)'}
    
    Create a structured learning path with:
    1. Clear phases/milestones
    2. Realistic timelines
    3. Specific resources and projects
    4. Prerequisites assessment
    5. Career outcomes
    
    Return a JSON object with this structure:
    {
      "title": "Learning Path Title",
      "description": "Brief description",
      "duration": "Total time estimate",
      "difficulty": "beginner|intermediate|advanced",
      "steps": [
        {
          "phase": "Phase name",
          "duration": "Time estimate",
          "skills": ["skill1", "skill2"],
          "resources": [
            {
              "type": "course|book|tutorial|project",
              "title": "Resource title",
              "url": "optional-url",
              "estimated_time": "time estimate"
            }
          ],
          "milestones": ["milestone1", "milestone2"]
        }
      ],
      "prerequisites": ["prereq1", "prereq2"],
      "careerOutcomes": ["outcome1", "outcome2"]
    }
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 1500,
    })

    const learningPath = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
    return learningPath as LearningPath
  } catch (error) {
    console.error('Error generating learning path:', error)
    return null
  }
}

/**
 * Generate market analysis for a specific technology
 */
export async function generateMarketAnalysis(
  technology: string,
  region: string = 'Global'
): Promise<MarketAnalysis | null> {
  const prompt = `
    Provide a comprehensive market analysis for "${technology}" in the ${region} market:
    
    Include:
    1. Current market size and growth projections
    2. Demand level and job availability
    3. Average salary ranges
    4. Required skills and competencies
    5. Industry adoption rates by sector
    6. Competitive advantages for professionals
    7. Future outlook and sustainability
    
    Return a JSON object with this structure:
    {
      "trend": "${technology}",
      "marketSize": "description of current market size",
      "growthProjection": "growth rate and projections",
      "demandLevel": "very-high|high|medium|low",
      "averageSalary": "salary range",
      "jobAvailability": "availability description",
      "skillRequirements": ["skill1", "skill2"],
      "industryAdoption": [
        {
          "industry": "industry name",
          "adoptionLevel": "high|medium|low",
          "timeline": "adoption timeline"
        }
      ],
      "competitiveAdvantage": "advantages for professionals",
      "futureOutlook": "future predictions"
    }
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 1200,
    })

    const analysis = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
    return analysis as MarketAnalysis
  } catch (error) {
    console.error('Error generating market analysis:', error)
    return null
  }
}

/**
 * Handle general trend-related queries
 */
export async function handleTrendQuery(
  query: string,
  context?: {
    userSkills?: string[]
    userIndustry?: string
    availableTrends?: ITTrend[]
  }
): Promise<string> {
  const contextInfo = context ? `
    User Context:
    - Skills: ${context.userSkills?.join(', ') || 'Not specified'}
    - Industry: ${context.userIndustry || 'Not specified'}
    - Available Trends: ${context.availableTrends?.map(t => t.name).join(', ') || 'Various IT trends'}
  ` : ''

  const prompt = `
    You are an expert IT trends analyst and career advisor. Answer the following question about technology trends:
    
    Question: ${query}
    
    ${contextInfo}
    
    Provide a comprehensive, actionable response that:
    1. Directly answers the question
    2. Includes specific examples and data when possible
    3. Offers practical advice for career development
    4. Considers current market conditions
    5. Suggests concrete next steps
    
    Keep the response informative but conversational, and aim for 2-3 paragraphs.
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 800,
    })

    return text
  } catch (error) {
    console.error('Error handling trend query:', error)
    return "I'm sorry, I encountered an error while processing your question about IT trends. Please try again or rephrase your question."
  }
}

/**
 * Compare multiple technologies
 */
export async function compareTechnologies(
  technologies: string[],
  criteria: string[] = ['learning_curve', 'market_demand', 'salary_potential', 'future_prospects']
): Promise<string> {
  const prompt = `
    Compare these technologies: ${technologies.join(', ')}
    
    Evaluation criteria: ${criteria.join(', ')}
    
    Provide a detailed comparison covering:
    1. Learning curve and difficulty
    2. Current market demand
    3. Salary potential
    4. Future growth prospects
    5. Use cases and applications
    6. Career opportunities
    
    Structure as a clear comparison with pros/cons for each technology.
    Include a recommendation for different career scenarios.
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 1000,
    })

    return text
  } catch (error) {
    console.error('Error comparing technologies:', error)
    return "I'm sorry, I couldn't complete the technology comparison. Please try again."
  }
} 