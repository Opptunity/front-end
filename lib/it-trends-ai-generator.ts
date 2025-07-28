import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { ITTrend } from "@/app/api/it-trends/route"

interface TrendGenerationOptions {
  categories?: string[]
  count?: number
  region?: string
  timeframe?: string
  focusAreas?: string[]
}

/**
 * Generate IT trends using AI based on current market conditions and technology landscape
 */
export async function generateITTrends(options: TrendGenerationOptions = {}): Promise<ITTrend[]> {
  const {
    categories = ['frontend', 'backend', 'ai/ml', 'devops', 'mobile', 'web3', 'security', 'cloud', 'data', 'emerging'],
    count = 22,
    region = 'Global',
    timeframe = 'current and next 6 months',
    focusAreas = []
  } = options

  const currentDate = new Date().toISOString().split('T')[0]
  
  const prompt = `
    You are an expert technology analyst and market researcher. Generate a comprehensive list of ${count} current IT trends for ${region} market as of ${currentDate}.
    
    Focus on trends that are:
    - Currently gaining significant traction in the industry
    - Backed by real market demand and job growth
    - Representing actual technological shifts happening now
    - Relevant for the ${timeframe} timeframe
    
    Categories to cover: ${categories.join(', ')}
    ${focusAreas.length > 0 ? `Special focus areas: ${focusAreas.join(', ')}` : ''}
    
    DISTRIBUTION REQUIREMENT: Ensure good coverage across ALL categories. Aim for roughly:
    - frontend: 2-3 trends
    - backend: 2-3 trends  
    - ai/ml: 3-4 trends (hot area)
    - devops: 2-3 trends
    - cloud: 2-3 trends
    - mobile: 1-2 trends
    - security: 1-2 trends
    - data: 1-2 trends
    - web3: 1-2 trends
    - emerging: 2-3 trends
    
    For each trend, provide realistic and current market data. Base job openings on actual market conditions, salary ranges on current industry standards, and growth rates on observable trends.
    
    IMPORTANT: 
    - Use real, current technology names and concepts
    - Provide accurate, realistic market data (job numbers, salaries, growth rates)
    - Include actual learning resources that exist
    - Make skills lists practical and specific
    - Ensure prerequisites are realistic
    - MUST distribute across ALL specified categories
    
    Return a JSON array with exactly this structure for each trend:
    
    [
      {
        "id": "kebab-case-unique-id",
        "name": "Technology/Trend Name",
        "category": "one of: frontend|backend|ai/ml|devops|mobile|web3|security|cloud|data|emerging",
        "description": "Clear description of what this trend is and why it matters (2-3 sentences)",
        "popularity": "one of: rising|hot|stable|declining",
        "relevance": "one of: high|medium|low",
        "skills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
        "learningResources": [
          {
            "type": "one of: documentation|course|tutorial|book|certification",
            "title": "Resource Title",
            "url": "https://actual-url.com",
            "provider": "Provider Name"
          },
          {
            "type": "course",
            "title": "Another Resource",
            "url": "https://another-url.com", 
            "provider": "Provider"
          }
        ],
        "marketDemand": {
          "jobOpenings": realistic_number_based_on_current_market,
          "salaryRange": "$realistic_range_based_on_current_market",
          "growthRate": "realistic_percentage_based_on_industry_data"
        },
        "timeToLearn": "realistic timeframe like: 2-4 months, 6-12 months, etc.",
        "prerequisites": ["prereq1", "prereq2", "prereq3"],
        "relatedTechnologies": ["related1", "related2", "related3"],
        "lastUpdated": "${new Date().toISOString()}"
      }
    ]
    
    Ensure the response is valid JSON and includes exactly ${count} trends distributed across the specified categories.
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 8000,
      temperature: 0.7,
    })

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response')
    }

    const trends = JSON.parse(jsonMatch[0]) as ITTrend[]
    
    // Validate and sanitize the response
    const validatedTrends = trends.filter(trend => 
      trend.id && 
      trend.name && 
      trend.category && 
      trend.description &&
      Array.isArray(trend.skills) &&
      trend.skills.length > 0
    ).map(trend => ({
      ...trend,
      lastUpdated: new Date().toISOString()
    }))

    if (validatedTrends.length === 0) {
      throw new Error('No valid trends generated')
    }

    return validatedTrends

  } catch (error) {
    console.error('Error generating IT trends with AI:', error)
    throw new Error(`Failed to generate IT trends: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate trends for specific categories
 */
export async function generateTrendsForCategory(category: string, count: number = 5): Promise<ITTrend[]> {
  return generateITTrends({
    categories: [category],
    count,
    focusAreas: [`${category} development`, `${category} technologies`, `${category} best practices`]
  })
}

/**
 * Generate emerging trends specifically
 */
export async function generateEmergingTrends(count: number = 8): Promise<ITTrend[]> {
  const currentDate = new Date().toISOString().split('T')[0]
  
  const prompt = `
    You are a cutting-edge technology analyst. Generate ${count} truly emerging IT trends as of ${currentDate}.
    
    Focus on:
    - Technologies in early adoption phase
    - Breakthrough research becoming practical
    - New paradigms gaining enterprise interest
    - Technologies with high future potential but limited current adoption
    
    These should be bleeding-edge trends that forward-thinking companies are starting to explore.
    
    Return a JSON array with the same structure as before, but ensure these are genuinely emerging/experimental technologies.
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 4000,
      temperature: 0.8, // Higher temperature for more creative/emerging ideas
    })

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response')
    }

    const trends = JSON.parse(jsonMatch[0]) as ITTrend[]
    
    return trends.map(trend => ({
      ...trend,
      category: 'emerging' as const,
      popularity: 'rising' as const,
      lastUpdated: new Date().toISOString()
    }))

  } catch (error) {
    console.error('Error generating emerging trends:', error)
    throw new Error(`Failed to generate emerging trends: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Refresh trends with market intelligence
 */
export async function refreshTrendsWithMarketData(existingTrends: ITTrend[]): Promise<ITTrend[]> {
  const trendNames = existingTrends.map(t => t.name).join(', ')
  
  const prompt = `
    Update the market data for these IT trends based on current market conditions: ${trendNames}
    
    For each trend, provide updated:
    - Job opening counts (realistic current numbers)
    - Salary ranges (current market rates)
    - Growth rates (based on recent industry data)
    - Popularity status (rising/hot/stable/declining)
    
    Return a JSON object with trend names as keys and updated market data:
    {
      "Trend Name": {
        "jobOpenings": number,
        "salaryRange": "string",
        "growthRate": "string",
        "popularity": "rising|hot|stable|declining"
      }
    }
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 2000,
    })

    const marketUpdates = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}')
    
    return existingTrends.map(trend => {
      const update = marketUpdates[trend.name]
      if (update) {
        return {
          ...trend,
          marketDemand: {
            jobOpenings: update.jobOpenings || trend.marketDemand.jobOpenings,
            salaryRange: update.salaryRange || trend.marketDemand.salaryRange,
            growthRate: update.growthRate || trend.marketDemand.growthRate
          },
          popularity: update.popularity || trend.popularity,
          lastUpdated: new Date().toISOString()
        }
      }
      return trend
    })

  } catch (error) {
    console.error('Error refreshing market data:', error)
    return existingTrends // Return original trends if update fails
  }
} 