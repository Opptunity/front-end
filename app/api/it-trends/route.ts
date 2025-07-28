import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { aiTrendsCache } from "@/lib/it-trends-cache"

// Types for IT trends
export type ITTrend = {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'ai/ml' | 'devops' | 'mobile' | 'web3' | 'security' | 'cloud' | 'data' | 'emerging'
  description: string
  popularity: 'rising' | 'hot' | 'stable' | 'declining'
  relevance: 'high' | 'medium' | 'low'
  skills: string[]
  learningResources: Array<{
    type: 'documentation' | 'course' | 'tutorial' | 'book' | 'certification'
    title: string
    url: string
    provider: string
  }>
  marketDemand: {
    jobOpenings: number
    salaryRange: string
    growthRate: string
  }
  timeToLearn: string
  prerequisites: string[]
  relatedTechnologies: string[]
  lastUpdated: string
}

// AI-powered trend analysis for personalization
const analyzePersonalizedTrends = async (trends: ITTrend[], userSkills: string[], userIndustry: string): Promise<ITTrend[]> => {
  // Use AI to personalize trend relevance
  const prompt = `
    Given a user with skills: ${userSkills.join(', ')} 
    Working in industry: ${userIndustry}
    
    Analyze these IT trends and rank them by relevance for this user's career growth.
    Consider: skill overlap, learning curve, market demand, and career progression opportunities.
    
    Return a JSON array of trend IDs ordered by relevance (most relevant first).
    Available trends: ${trends.map(t => `${t.id}: ${t.name}`).join(', ')}
  `

  try {
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 500,
    })

    // Parse AI response and reorder trends
    const trendIds = JSON.parse(text.match(/\[.*\]/)?.[0] || '[]')
    const reorderedTrends = trendIds
      .map((id: string) => trends.find(t => t.id === id))
      .filter(Boolean)
    
    // Add any missing trends at the end
    const includedIds = new Set(trendIds)
    const remainingTrends = trends.filter(t => !includedIds.has(t.id))
    
    return [...reorderedTrends, ...remainingTrends]
  } catch (error) {
    console.error('Error personalizing trends:', error)
    return trends
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const personalize = searchParams.get('personalize') === 'true'
    const userSkills = searchParams.get('skills')?.split(',') || []
    const userIndustry = searchParams.get('industry') || 'technology'
    const forceRefresh = searchParams.get('force_refresh') === 'true'

    console.log(`🌐 API /it-trends called: category=${category}, personalize=${personalize}, forceRefresh=${forceRefresh}, userSkillsCount=${userSkills.length}`)

    let trends: ITTrend[] = []

    try {
      // Get AI-generated trends from cache or generate new ones
    if (category && category !== 'all') {
        console.log(`📂 Getting category-specific trends for: ${category}`)
        // Get category-specific trends
        trends = await aiTrendsCache.getTrendsForCategory(category, forceRefresh)
      } else {
        console.log(`📊 Getting all trends`)
        // Get all trends
        trends = await aiTrendsCache.getTrends(forceRefresh)
    }

    // Only personalize if explicitly requested AND we have user skills
    // AND we're not just doing a simple category filter
    if (personalize && userSkills.length > 0 && (!category || category === 'all')) {
      try {
          const personalizedTrends = await analyzePersonalizedTrends(trends, userSkills, userIndustry)
        trends = personalizedTrends
      } catch (error) {
        console.error('Error personalizing trends, falling back to default:', error)
        // Keep the original trends if personalization fails
      }
      }
    } catch (error) {
      console.error('Error getting AI trends:', error)
      // Return empty trends array if AI generation fails completely
      trends = []
    }

    return NextResponse.json({
      trends,
      categories: aiTrendsCache.getCategories(),
      lastUpdated: new Date().toISOString(),
      totalTrends: trends.length,
      isPersonalized: personalize && userSkills.length > 0 && (!category || category === 'all'),
      isAIGenerated: true,
      cacheStats: aiTrendsCache.getCacheStats()
    })
  } catch (error) {
    console.error('Error fetching IT trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch IT trends' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, userProfile } = body

    if (action === 'get-recommendations') {
      // Get AI-generated trends first
      const allTrends = await aiTrendsCache.getTrends()
      
      // Get personalized trend recommendations based on user profile
      const personalizedTrends = await analyzePersonalizedTrends(
        allTrends,
        userProfile.technicalSkills?.map((s: any) => s.skill) || [],
        userProfile.industry || 'technology'
      )

      return NextResponse.json({
        recommendations: personalizedTrends.slice(0, 5), // Top 5 recommendations
        learningPath: personalizedTrends.slice(0, 3).map(trend => ({
          trend: trend.name,
          timeToLearn: trend.timeToLearn,
          prerequisites: trend.prerequisites,
          nextSteps: trend.learningResources.slice(0, 2)
        })),
        isAIGenerated: true
      })
    }

    if (action === 'force-regenerate') {
      // Force regenerate all trends
      const newTrends = await aiTrendsCache.forceRegenerate()
      return NextResponse.json({
        message: 'Trends regenerated successfully',
        trendsCount: newTrends.length,
        lastGenerated: new Date().toISOString()
      })
    }

    if (action === 'refresh-market-data') {
      // Refresh market data for existing trends
      await aiTrendsCache.refreshMarketData()
      return NextResponse.json({
        message: 'Market data refreshed successfully',
        lastRefresh: new Date().toISOString()
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
} 