import type { ITTrend } from "@/app/api/it-trends/route"
import type { TrendRecommendation, LearningPath, MarketAnalysis } from "@/lib/it-trends-ai-agent"
import { generateITTrends, generateTrendsForCategory, refreshTrendsWithMarketData } from "@/lib/it-trends-ai-generator"
import { promises as fs } from 'fs'
import { join } from 'path'

// Cache configuration for AI-generated content
const CACHE_DURATION = {
  TRENDS: 4 * 60 * 60 * 1000, // 4 hours (AI-generated comprehensive trends)
  CATEGORY_TRENDS: 4 * 60 * 60 * 1000, // 4 hours (same as main trends since they're filtered from main)
  RECOMMENDATIONS: 2 * 60 * 60 * 1000, // 2 hours
  LEARNING_PATHS: 24 * 60 * 60 * 1000, // 24 hours
  MARKET_ANALYSIS: 12 * 60 * 60 * 1000, // 12 hours
  MARKET_REFRESH: 8 * 60 * 60 * 1000, // 8 hours for market data refresh
}

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
  generationOptions?: any // Track generation parameters
}

interface TrendCache {
  trends: CacheItem<ITTrend[]> | null
  categoryTrends: Map<string, CacheItem<ITTrend[]>>
  categories: CacheItem<string[]> | null
  recommendations: Map<string, CacheItem<TrendRecommendation[]>>
  learningPaths: Map<string, CacheItem<LearningPath>>
  marketAnalysis: Map<string, CacheItem<MarketAnalysis>>
  generationInProgress: Set<string> // Track ongoing AI generations
}

class AITrendsCache {
  private cache: TrendCache = {
    trends: null,
    categoryTrends: new Map(),
    categories: null,
    recommendations: new Map(),
    learningPaths: new Map(),
    marketAnalysis: new Map(),
    generationInProgress: new Set(),
  }

  private createCacheKey(data: any): string {
    return JSON.stringify(data)
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() > item.expiresAt
  }

  private createCacheItem<T>(data: T, duration: number, options?: any): CacheItem<T> {
    const timestamp = Date.now()
    return {
      data,
      timestamp,
      expiresAt: timestamp + duration,
      generationOptions: options,
    }
  }

  // AI-generated trends caching
  async getTrends(forceRefresh: boolean = false): Promise<ITTrend[]> {
    const cacheKey = 'all-trends'
    
    console.log(`🔍 getTrends called: forceRefresh=${forceRefresh}, cacheExists=${!!this.cache.trends}, cacheExpired=${this.cache.trends ? this.isExpired(this.cache.trends) : 'N/A'}`)
    
    // Check if generation is already in progress
    if (this.cache.generationInProgress.has(cacheKey)) {
      console.log('⏳ AI generation already in progress, waiting...')
      // Wait a bit and try to get cached data
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (this.cache.trends && !this.isExpired(this.cache.trends)) {
        console.log('✅ Returning cached trends after waiting for generation')
        return this.cache.trends.data
      }
    }

    // Return cached data if valid and not forcing refresh
    if (!forceRefresh && this.cache.trends && !this.isExpired(this.cache.trends)) {
      console.log(`✅ Returning cached trends (${this.cache.trends.data.length} trends, generated: ${this.cache.trends.generationOptions?.generatedAt})`)
      return this.cache.trends.data
    }

    // Load from persistent cache if available
    if (!this.cache.trends || this.isExpired(this.cache.trends)) {
      const persistentTrends = await this.loadFromPersistentCache()
      if (persistentTrends && persistentTrends.length > 0) {
        console.log(`📁 Loaded ${persistentTrends.length} trends from persistent cache`)
        this.cache.trends = this.createCacheItem(persistentTrends, CACHE_DURATION.TRENDS, {
          generatedAt: new Date().toISOString(),
          method: 'loaded-from-persistent-cache',
          count: persistentTrends.length
        })
        return persistentTrends
      }
    }

    // Generate new trends with AI
    try {
      this.cache.generationInProgress.add(cacheKey)
      console.log('🤖 Generating IT trends with AI...')
      
      const aiTrends = await generateITTrends({
        count: 22,
        region: 'Global',
        timeframe: 'current and next 6 months'
      })

      console.log(`✅ Generated ${aiTrends.length} trends with AI`)

      this.cache.trends = this.createCacheItem(aiTrends, CACHE_DURATION.TRENDS, {
        generatedAt: new Date().toISOString(),
        method: 'ai-generated',
        count: aiTrends.length
      })

      // Save to persistent cache
      await this.saveToPersistentCache(aiTrends)

      return aiTrends
    } catch (error) {
      console.error('❌ Error generating trends with AI:', error)
      
      // Return cached data if available, even if expired
      if (this.cache.trends) {
        console.log('⚠️ Falling back to cached trends due to AI generation error')
        return this.cache.trends.data
      }
      
      // If no cached data, return empty array
      console.log('❌ No cached data available, returning empty array')
      return []
    } finally {
      this.cache.generationInProgress.delete(cacheKey)
    }
  }

  async getTrendsForCategory(category: string, forceRefresh: boolean = false): Promise<ITTrend[]> {
    console.log(`🔍 getTrendsForCategory called: category=${category}, forceRefresh=${forceRefresh}`)
    
    // Return cached filtered data if valid and not forcing refresh
    if (!forceRefresh) {
      const cached = this.cache.categoryTrends.get(category)
      if (cached && !this.isExpired(cached)) {
        console.log(`✅ Returning cached category trends (${cached.data.length} trends for ${category})`)
        return cached.data
      }
    }

    // Get comprehensive trends first (this may trigger AI generation if cache is empty)
    console.log(`📊 Getting comprehensive trends to filter for category: ${category}`)
    const allTrends = await this.getTrends(forceRefresh)
    
    // Filter trends by category (no AI call needed!)
    const categoryTrends = allTrends.filter(trend => trend.category === category)
    
    console.log(`🎯 Filtered ${categoryTrends.length} trends for category: ${category} (from ${allTrends.length} total)`)
    
    // Cache the filtered result
    this.cache.categoryTrends.set(
      category,
      this.createCacheItem(categoryTrends, CACHE_DURATION.CATEGORY_TRENDS, {
        category,
        filteredAt: new Date().toISOString(),
        method: 'filtered-from-comprehensive',
        totalTrends: allTrends.length,
        filteredCount: categoryTrends.length
      })
    )

    return categoryTrends
  }

  async refreshMarketData(): Promise<void> {
    if (!this.cache.trends || this.isExpired(this.cache.trends)) {
      return
    }

    try {
      console.log('Refreshing market data for existing trends...')
      const refreshedTrends = await refreshTrendsWithMarketData(this.cache.trends.data)
      
      // Update the cache with refreshed market data
      this.cache.trends = this.createCacheItem(
        refreshedTrends, 
        CACHE_DURATION.TRENDS,
        {
          ...this.cache.trends.generationOptions,
          lastMarketRefresh: new Date().toISOString()
        }
      )
      
      console.log('Market data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing market data:', error)
    }
  }

  // Categories caching
  setCategories(categories: string[]): void {
    this.cache.categories = this.createCacheItem(categories, CACHE_DURATION.TRENDS)
  }

  getCategories(): string[] {
    const defaultCategories = ['all', 'frontend', 'backend', 'ai/ml', 'devops', 'mobile', 'web3', 'security', 'cloud', 'data', 'emerging']
    
    if (!this.cache.categories || this.isExpired(this.cache.categories)) {
      this.setCategories(defaultCategories)
      return defaultCategories
    }
    return this.cache.categories.data
  }

  // Recommendations caching
  setRecommendations(
    userProfile: {
      skills: string[]
      industry: string
      experienceLevel: string
    },
    recommendations: TrendRecommendation[]
  ): void {
    const key = this.createCacheKey(userProfile)
    this.cache.recommendations.set(
      key,
      this.createCacheItem(recommendations, CACHE_DURATION.RECOMMENDATIONS)
    )
  }

  getRecommendations(userProfile: {
    skills: string[]
    industry: string
    experienceLevel: string
  }): TrendRecommendation[] | null {
    const key = this.createCacheKey(userProfile)
    const cached = this.cache.recommendations.get(key)
    
    if (!cached || this.isExpired(cached)) {
      this.cache.recommendations.delete(key)
      return null
    }
    
    return cached.data
  }

  // Learning paths caching
  setLearningPath(
    technology: string,
    userProfile: {
      skills: string[]
      experienceLevel: string
      timeCommitment?: string
    },
    learningPath: LearningPath
  ): void {
    const key = this.createCacheKey({ technology, userProfile })
    this.cache.learningPaths.set(
      key,
      this.createCacheItem(learningPath, CACHE_DURATION.LEARNING_PATHS)
    )
  }

  getLearningPath(
    technology: string,
    userProfile: {
      skills: string[]
      experienceLevel: string
      timeCommitment?: string
    }
  ): LearningPath | null {
    const key = this.createCacheKey({ technology, userProfile })
    const cached = this.cache.learningPaths.get(key)
    
    if (!cached || this.isExpired(cached)) {
      this.cache.learningPaths.delete(key)
      return null
    }
    
    return cached.data
  }

  // Market analysis caching
  setMarketAnalysis(technology: string, region: string, analysis: MarketAnalysis): void {
    const key = this.createCacheKey({ technology, region })
    this.cache.marketAnalysis.set(
      key,
      this.createCacheItem(analysis, CACHE_DURATION.MARKET_ANALYSIS)
    )
  }

  getMarketAnalysis(technology: string, region: string): MarketAnalysis | null {
    const key = this.createCacheKey({ technology, region })
    const cached = this.cache.marketAnalysis.get(key)
    
    if (!cached || this.isExpired(cached)) {
      this.cache.marketAnalysis.delete(key)
      return null
    }
    
    return cached.data
  }

  // Cache management
  clearExpired(): void {
    // Clear expired trends
    if (this.cache.trends && this.isExpired(this.cache.trends)) {
      this.cache.trends = null
    }

    // Clear expired category trends
    for (const [key, item] of this.cache.categoryTrends.entries()) {
      if (this.isExpired(item)) {
        this.cache.categoryTrends.delete(key)
      }
    }

    // Clear expired categories
    if (this.cache.categories && this.isExpired(this.cache.categories)) {
      this.cache.categories = null
    }

    // Clear expired recommendations
    for (const [key, item] of this.cache.recommendations.entries()) {
      if (this.isExpired(item)) {
        this.cache.recommendations.delete(key)
      }
    }

    // Clear expired learning paths
    for (const [key, item] of this.cache.learningPaths.entries()) {
      if (this.isExpired(item)) {
        this.cache.learningPaths.delete(key)
      }
    }

    // Clear expired market analysis
    for (const [key, item] of this.cache.marketAnalysis.entries()) {
      if (this.isExpired(item)) {
        this.cache.marketAnalysis.delete(key)
      }
    }
  }

  clearAll(): void {
    this.cache = {
      trends: null,
      categoryTrends: new Map(),
      categories: null,
      recommendations: new Map(),
      learningPaths: new Map(),
      marketAnalysis: new Map(),
      generationInProgress: new Set(),
    }
  }

  getCacheStats(): {
    trends: boolean
    categoryTrends: number
    categories: boolean
    recommendations: number
    learningPaths: number
    marketAnalysis: number
    generationInProgress: number
    totalSize: number
    lastGenerated?: string
  } {
    return {
      trends: !!this.cache.trends && !this.isExpired(this.cache.trends),
      categoryTrends: this.cache.categoryTrends.size,
      categories: !!this.cache.categories && !this.isExpired(this.cache.categories),
      recommendations: this.cache.recommendations.size,
      learningPaths: this.cache.learningPaths.size,
      marketAnalysis: this.cache.marketAnalysis.size,
      generationInProgress: this.cache.generationInProgress.size,
      totalSize: JSON.stringify(this.cache).length,
      lastGenerated: this.cache.trends?.generationOptions?.generatedAt,
    }
  }

  // Force regeneration of all trends
  async forceRegenerate(): Promise<ITTrend[]> {
    console.log('Force regenerating all IT trends...')
    return this.getTrends(true)
  }

  // Background market data refresh
  async scheduleMarketRefresh(): Promise<void> {
    if (!this.cache.trends) return
    
    const lastRefresh = this.cache.trends.generationOptions?.lastMarketRefresh
    const refreshInterval = CACHE_DURATION.MARKET_REFRESH
    
    if (!lastRefresh || (Date.now() - new Date(lastRefresh).getTime()) > refreshInterval) {
      await this.refreshMarketData()
    }
  }

  // Persistent cache methods (file-based)
  private getCacheFilePath(): string {
    // Store in a .cache directory in the project root
    return join(process.cwd(), '.cache', 'it-trends-cache.json')
  }

  private async ensureCacheDirectory(): Promise<void> {
    try {
      const cacheDir = join(process.cwd(), '.cache')
      await fs.mkdir(cacheDir, { recursive: true })
    } catch (error) {
      console.warn('Could not create cache directory:', error)
    }
  }

  private async saveToPersistentCache(trends: ITTrend[]): Promise<void> {
    try {
      await this.ensureCacheDirectory()
      const cacheData = {
        trends,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION.TRENDS,
        version: '1.0'
      }
      
      const filePath = this.getCacheFilePath()
      await fs.writeFile(filePath, JSON.stringify(cacheData, null, 2))
      console.log(`💾 Saved ${trends.length} trends to persistent cache: ${filePath}`)
    } catch (error) {
      console.warn('Could not save to persistent cache:', error)
    }
  }

  private async loadFromPersistentCache(): Promise<ITTrend[] | null> {
    try {
      const filePath = this.getCacheFilePath()
      const data = await fs.readFile(filePath, 'utf-8')
      const cacheData = JSON.parse(data)
      
      // Check if cache is still valid
      if (Date.now() > cacheData.expiresAt) {
        console.log('📁 Persistent cache expired, ignoring')
        return null
      }
      
      console.log(`📁 Loaded ${cacheData.trends?.length || 0} trends from persistent cache`)
      return cacheData.trends || []
    } catch (error) {
      // File doesn't exist or is corrupted, not a problem
      console.log('📁 No valid persistent cache found')
      return null
    }
  }
}

// Singleton instance
export const aiTrendsCache = new AITrendsCache()

// Auto-cleanup expired items every 30 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    aiTrendsCache.clearExpired()
  }, 30 * 60 * 1000)

  // Schedule market data refresh every 2 hours
  setInterval(() => {
    aiTrendsCache.scheduleMarketRefresh()
  }, 2 * 60 * 60 * 1000)
}

// Export for backward compatibility
export const trendsCache = aiTrendsCache
export const persistentTrendsCache = aiTrendsCache 