import type { ITTrend } from "@/app/api/it-trends/route"
import type { TrendRecommendation, LearningPath, MarketAnalysis } from "@/lib/it-trends-ai-agent"

// Cache configuration
const CACHE_DURATION = {
  TRENDS: 6 * 60 * 60 * 1000, // 6 hours
  RECOMMENDATIONS: 2 * 60 * 60 * 1000, // 2 hours
  LEARNING_PATHS: 24 * 60 * 60 * 1000, // 24 hours
  MARKET_ANALYSIS: 12 * 60 * 60 * 1000, // 12 hours
}

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface TrendCache {
  trends: CacheItem<ITTrend[]> | null
  categories: CacheItem<string[]> | null
  recommendations: Map<string, CacheItem<TrendRecommendation[]>>
  learningPaths: Map<string, CacheItem<LearningPath>>
  marketAnalysis: Map<string, CacheItem<MarketAnalysis>>
}

class ITTrendsCache {
  private cache: TrendCache = {
    trends: null,
    categories: null,
    recommendations: new Map(),
    learningPaths: new Map(),
    marketAnalysis: new Map(),
  }

  private createCacheKey(data: any): string {
    return JSON.stringify(data)
  }

  private isExpired(item: CacheItem<any>): boolean {
    return Date.now() > item.expiresAt
  }

  private createCacheItem<T>(data: T, duration: number): CacheItem<T> {
    const timestamp = Date.now()
    return {
      data,
      timestamp,
      expiresAt: timestamp + duration,
    }
  }

  // Trends caching
  setTrends(trends: ITTrend[]): void {
    this.cache.trends = this.createCacheItem(trends, CACHE_DURATION.TRENDS)
  }

  getTrends(): ITTrend[] | null {
    if (!this.cache.trends || this.isExpired(this.cache.trends)) {
      this.cache.trends = null
      return null
    }
    return this.cache.trends.data
  }

  // Categories caching
  setCategories(categories: string[]): void {
    this.cache.categories = this.createCacheItem(categories, CACHE_DURATION.TRENDS)
  }

  getCategories(): string[] | null {
    if (!this.cache.categories || this.isExpired(this.cache.categories)) {
      this.cache.categories = null
      return null
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
      categories: null,
      recommendations: new Map(),
      learningPaths: new Map(),
      marketAnalysis: new Map(),
    }
  }

  getCacheStats(): {
    trends: boolean
    categories: boolean
    recommendations: number
    learningPaths: number
    marketAnalysis: number
    totalSize: number
  } {
    return {
      trends: !!this.cache.trends && !this.isExpired(this.cache.trends),
      categories: !!this.cache.categories && !this.isExpired(this.cache.categories),
      recommendations: this.cache.recommendations.size,
      learningPaths: this.cache.learningPaths.size,
      marketAnalysis: this.cache.marketAnalysis.size,
      totalSize: JSON.stringify(this.cache).length,
    }
  }

  // Preload popular trends
  async preloadPopularTrends(): Promise<void> {
    try {
      const response = await fetch('/api/it-trends?category=all')
      const data = await response.json()
      
      if (data.trends) {
        this.setTrends(data.trends)
      }
      
      if (data.categories) {
        this.setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error preloading trends:', error)
    }
  }
}

// Singleton instance
export const trendsCache = new ITTrendsCache()

// Auto-cleanup expired items every 30 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    trendsCache.clearExpired()
  }, 30 * 60 * 1000)
}

// Browser storage integration for persistence
export class PersistentTrendsCache extends ITTrendsCache {
  private readonly storageKey = 'opptunity-trends-cache'

  constructor() {
    super()
    this.loadFromStorage()
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        // Only load non-expired items
        if (data.trends && !this.isExpired(data.trends)) {
          this.setTrends(data.trends.data)
        }
        if (data.categories && !this.isExpired(data.categories)) {
          this.setCategories(data.categories.data)
        }
      }
    } catch (error) {
      console.error('Error loading cache from storage:', error)
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const toStore = {
        trends: this.cache.trends,
        categories: this.cache.categories,
        timestamp: Date.now(),
      }
      localStorage.setItem(this.storageKey, JSON.stringify(toStore))
    } catch (error) {
      console.error('Error saving cache to storage:', error)
    }
  }

  override setTrends(trends: ITTrend[]): void {
    super.setTrends(trends)
    this.saveToStorage()
  }

  override setCategories(categories: string[]): void {
    super.setCategories(categories)
    this.saveToStorage()
  }
}

// Export the persistent cache as default
export const persistentTrendsCache = new PersistentTrendsCache() 